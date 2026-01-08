import { connectorConfigSchema } from "../dummy";
import { buildDummyClient } from "../client";
import {
  IntegrationAction,
  IntegrationActionExecutePayload,
  IntegrationActionExecuteResult,
} from "../../types";
import { z } from "zod/v4";

const configSchema = z.object({
  mappings: z
    .array(
      z.object({
        name: z.string().meta({
          title: "Name",
          description: "The name of the property to create",
        }),
        value: z.any().meta({
          title: "Value",
          description: "The value of the property to create",
        }),
      }),
    )
    .optional(),
});

export const buildCreateProductAction = (): IntegrationAction => {
  return {
    name: "Create Product",
    description: "Create a new product",
    config: {
      schema: configSchema,
      uiSchema: {
        mappings: {
          name: {
            "ui:widget": "IntegrationAutocompleteWidget",
            "ui:options": {
              slug: "listProductProperties",
              params: {},
            },
          },
        },
      },
    },
    execute: async (
      payload: IntegrationActionExecutePayload<
        z.infer<typeof connectorConfigSchema>,
        z.infer<typeof configSchema>
      >,
    ): Promise<IntegrationActionExecuteResult> => {
      const { config } = payload;

      const { mappings = [] } = config;

      const dummyClient = buildDummyClient();

      const product = await dummyClient.product.create(
        Object.fromEntries(
          mappings.map((mapping) => [mapping.name, mapping.value]),
        ),
      );

      return {
        outcome: "executed",
        data: product,
        title: `✅ Product #${product.id} created`,
      };
    },
  };
};
