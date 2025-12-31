import express, { NextFunction, Response, Request, Router } from "express";
import { Logger } from "winston";
import bodyParser from "body-parser";
import cors from "cors";
import { z } from "zod/v4";
import type { Schema as JsonSchema } from "jsonschema";
import { Integration, IntegrationManifest } from "./types";

const toJsonSchema = (schema: z.ZodTypeAny): JsonSchema =>
  z.toJSONSchema(schema) as JsonSchema;

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
