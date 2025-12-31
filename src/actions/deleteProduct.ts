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

export const buildDeleteProductAction = (): IntegrationAction => {
  return {
    name: "deleteProduct",
    description: "Delete a product",
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

      const product = await dummyClient.product.delete(config.id.toString());

      return {
        outcome: "executed",
        data: product,
        title: `✅ Product #${product.id} deleted`,
      };
    },
  };
};
