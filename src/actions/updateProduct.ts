import { connectorConfigSchema } from "../dummy";
import { buildDummyClient } from "../client";
import {
  IntegrationAction,
  IntegrationActionExecutePayload,
  IntegrationActionExecuteResult,
} from "../../types";
import { z } from "zod/v4";

const configSchema = z.object({
  id: z.union([z.string(), z.number()]),
  mappings: z
    .array(
      z.object({
        name: z.string().meta({
          title: "Name",
          description: "The name of the property to update",
        }),
        value: z.any().meta({
          title: "Value",
          description: "The value of the property to update",
        }),
      }),
    )
    .optional(),
});

export const buildUpdateProductAction = (): IntegrationAction => {
  return {
    name: "Update Product",
    description: "Update a product",
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
      const { id, mappings = [] } = config;

      const dummyClient = buildDummyClient();

      const product = await dummyClient.product.update(
        id.toString(),
        Object.fromEntries(
          mappings.map((mapping) => [mapping.name, mapping.value]),
        ),
      );

      return {
        outcome: "executed",
        data: product,
        title: `✅ Product #${product.id} updated`,
      };
    },
  };
};
