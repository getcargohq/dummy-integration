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
});

export const buildGetProductAction = (): IntegrationAction => {
  return {
    name: "getProduct",
    description: "Get a product",
    config: {
      schema: configSchema,
      uiSchema: {},
    },
    execute: async (
      payload: IntegrationActionExecutePayload<
        z.infer<typeof connectorConfigSchema>,
        z.infer<typeof configSchema>
      >,
    ): Promise<IntegrationActionExecuteResult> => {
      const { config } = payload;

      const dummyClient = buildDummyClient();

      const { id } = config;

      const product = await dummyClient.product.get(id.toString());

      return {
        outcome: "executed",
        data: product,
        title:
          product === undefined ? `❌ Product not found` : `✅ Product found`,
      };
    },
  };
};
