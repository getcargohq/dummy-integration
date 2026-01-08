import express, { NextFunction, Response, Request, Router } from "express";
import { Logger } from "winston";
import bodyParser from "body-parser";
import cors from "cors";
import { z } from "zod/v4";
import type { Schema as JsonSchema } from "jsonschema";
import { Integration, IntegrationManifest } from "./types";

const toJsonSchema = (schema: z.ZodTypeAny): JsonSchema =>
  z.toJSONSchema(schema, {
    unrepresentable: "any",
    override: (context) => {
      const definition = context.zodSchema._zod.def;

      switch (definition.type) {
        // Support z.any() as array of all types
        case "any": {
          (context.jsonSchema as unknown as { type: string[] }).type = [
            "string",
            "number",
            "integer",
            "boolean",
            "object",
            "array",
            "null",
          ];
          break;
        }

        // Support 'date' type as string with date-time format
        case "date": {
          context.jsonSchema.type = "string";
          context.jsonSchema.format = "date-time";
          break;
        }

        // Remove additionalProperties from all schemas in allOf for intersections
        case "intersection": {
          if (context.jsonSchema.allOf !== undefined) {
            for (const schema of context.jsonSchema.allOf) {
              if (schema.additionalProperties !== undefined) {
                delete schema.additionalProperties;
              }
            }
          }
          break;
        }

        // Refactor union into oneOf + allOf with if/else
        case "union": {
          const { discriminator } = context.zodSchema._zod.def as {
            discriminator?: string;
          };

          if (discriminator === undefined) {
            if (
              context.jsonSchema.anyOf !== undefined &&
              context.jsonSchema.anyOf.length > 0
            ) {
              const { anyOf } = context.jsonSchema;
              const types = anyOf
                .map((option) => {
                  if (
                    option.type !== undefined &&
                    ["string", "number", "integer", "boolean"].includes(
                      option.type,
                    )
                  ) {
                    return option.type as string;
                  }

                  return undefined;
                })
                .filter((type): type is string => type !== undefined);

              if (types.length !== anyOf.length) {
                break;
              }

              (context.jsonSchema as unknown as { type: string[] }).type =
                types;
              delete context.jsonSchema.anyOf;

              break;
            }
            break;
          }

          const options: Array<{
            discriminatorProperty: z.core.JSONSchema.JSONSchema;
            otherProperties: Record<string, z.core.JSONSchema.JSONSchema>;
            requiredOtherProperties: string[];
          }> = context.jsonSchema.anyOf!.map((option) => {
            if (option.properties === undefined) {
              throw new Error(`Missing properties in union option.`);
            }

            const discriminatorProperty = option.properties[discriminator];

            if (
              discriminatorProperty === undefined ||
              typeof discriminatorProperty === "boolean"
            ) {
              throw new Error(
                `Missing discriminator property "${discriminator}" in union option.`,
              );
            }

            const otherProperties = Object.fromEntries(
              Object.entries(option.properties).filter(([key, value]) => {
                return key !== discriminator && typeof value !== "boolean";
              }) as Array<[string, z.core.JSONSchema.JSONSchema]>,
            );

            const requiredOtherProperties =
              option.required !== undefined
                ? option.required.filter((key) => {
                    return key !== discriminator;
                  })
                : [];

            return {
              discriminatorProperty,
              otherProperties,
              requiredOtherProperties,
            };
          });

          const defaultOption = options[0];

          if (defaultOption === undefined) {
            throw new Error(`Cannot process union with no options.`);
          }

          const discriminatorMeta = context.jsonSchema["discriminator"] as
            | {
                title?: string;
                description?: string;
              }
            | undefined;

          context.jsonSchema.type = "object";
          context.jsonSchema.properties = {
            [discriminator]: {
              type: "string",
              title:
                discriminatorMeta !== undefined
                  ? discriminatorMeta.title
                  : undefined,
              description:
                discriminatorMeta !== undefined
                  ? discriminatorMeta.description
                  : undefined,
              oneOf: options.map((option) => {
                return {
                  const: option.discriminatorProperty.const,
                  title: option.discriminatorProperty.title,
                  description: option.discriminatorProperty.description,
                };
              }),
              default: defaultOption.discriminatorProperty.const,
            },
          };
          context.jsonSchema.required = [discriminator];
          context.jsonSchema.allOf = options
            .map<z.core.JSONSchema.JSONSchema | undefined>((option) => {
              if (Object.keys(option.otherProperties).length === 0) {
                return undefined;
              }

              return {
                if: {
                  properties: {
                    [discriminator]: {
                      const: option.discriminatorProperty.const,
                    },
                  },
                },
                then: {
                  type: "object",
                  properties: option.otherProperties,
                  required: option.requiredOtherProperties,
                },
              };
            })
            .filter((schema): schema is z.core.JSONSchema.JSONSchema => {
              return schema !== undefined;
            });

          delete context.jsonSchema.anyOf;
          delete context.jsonSchema["discriminator"];

          break;
        }

        default: {
          break;
        }
      }
    },
  }) as JsonSchema;

type Dependencies = {
  logger: Logger;
  integration: Integration;
};

export const buildApp = (dependencies: Dependencies) => {
  const { logger, integration } = dependencies;

  const integrationRouter = Router();

  integrationRouter.get("/manifest", (req, res) => {
    res.json(buildManifest(integration));
  });

  integrationRouter.post("/authenticate", async (req, res) => {
    const result = await integration.authenticate(req.body);

    res.json(result);
  });

  integrationRouter.post("/listUsers", async (req, res) => {
    if (integration.listUsers === undefined) {
      res.json([]);
      return;
    }

    const result = await integration.listUsers(req.body);

    res.json(result);
  });

  integrationRouter.post("/actions/:slug/execute", async (req, res) => {
    const { slug } = req.params;

    if (integration.actions[slug] === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.actions[slug].execute(req.body);

    res.json(result);
  });

  integrationRouter.post("/extractors/:slug/fetch", async (req, res) => {
    const { slug } = req.params;

    if (integration.extractors[slug] === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.extractors[slug].fetch(req.body);

    res.json(result);
  });

  integrationRouter.post("/extractors/:slug/count", async (req, res) => {
    const { slug } = req.params;

    if (
      integration.extractors[slug] === undefined ||
      integration.extractors[slug].count === undefined
    ) {
      res.status(404);
      return;
    }

    const result = await integration.extractors[slug].count(req.body);

    res.json(result);
  });

  integrationRouter.post("/autocompletes/:slug", async (req, res) => {
    const { slug } = req.params;

    if (integration.autocompletes[slug] === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.autocompletes[slug].get(req.body);

    res.json(result);
  });

  integrationRouter.post("/dynamicSchemas/:slug", async (req, res) => {
    const { slug } = req.params;

    if (integration.dynamicSchemas[slug] === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.dynamicSchemas[slug].get(req.body);

    res.json(result);
  });

  integrationRouter.post("/completeOauth", async (req, res) => {
    if (integration.completeOauth === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.completeOauth(req.body);

    res.json(result);
  });

  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  app.use("/", integrationRouter);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    res.status(500).json({
      errorMessage: "Internal Server Error",
    });
  });

  return app;
};

const buildManifest = (integration: Integration): IntegrationManifest => {
  return {
    name: integration.name,
    description: integration.description,
    icon: integration.icon,
    color: integration.color,
    url: integration.url,
    connector: {
      rateLimit: integration.connector.rateLimit,
      config: {
        jsonSchema: toJsonSchema(integration.connector.config.schema),
        uiSchema: integration.connector.config.uiSchema,
      },
      caching: integration.connector.caching,
    },
    actions: Object.fromEntries(
      Object.entries(integration.actions).map(([key, action]) => [
        key,
        {
          name: action.name,
          description: action.description,
          config: {
            jsonSchema: toJsonSchema(action.config.schema),
            uiSchema: action.config.uiSchema,
          },
          rateLimits: action.rateLimits,
          isSerialized: action.isSerialized,
          retry: action.retry,
          executing: action.executing,
        },
      ]),
    ),
    extractors: Object.fromEntries(
      Object.entries(integration.extractors).map(([key, extractor]) => [
        key,
        {
          name: extractor.name,
          description: extractor.description,
          config: {
            jsonSchema: toJsonSchema(extractor.config.schema),
            uiSchema: extractor.config.uiSchema,
          },
          rateLimits: extractor.rateLimits,
          retry: extractor.retry,
          fetching: extractor.fetching,
          mode: extractor.mode,
          preview: extractor.preview,
        },
      ]),
    ),
    dynamicSchemas: Object.fromEntries(
      Object.entries(integration.dynamicSchemas).map(([key, dynamicSchema]) => [
        key,
        {
          params: {
            jsonSchema: toJsonSchema(dynamicSchema.params.schema),
          },
        },
      ]),
    ),
    autocompletes: Object.fromEntries(
      Object.entries(integration.autocompletes).map(([key, autocomplete]) => [
        key,
        {
          params: {
            jsonSchema: toJsonSchema(autocomplete.params.schema),
          },
          cacheExpirationInSeconds: autocomplete.cacheExpirationInSeconds,
        },
      ]),
    ),
  };
};
