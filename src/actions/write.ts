import { ConnectorConfig, WriteActionConfig } from "../dummy";
import { buildDummyClient, DummyClient } from "../client";
import {
  IntegrationActionExecutePayload,
  IntegrationActionExecuteResult,
} from "../../types";

export type WriteActionPayload = IntegrationActionExecutePayload<
  ConnectorConfig,
  WriteActionConfig
>;

export type WriteActionResult = IntegrationActionExecuteResult;

export const writeAction = async (
  payload: WriteActionPayload,
): Promise<WriteActionResult> => {
  const { connector, config } = payload;
  const { objectType } = config;

  const dummyClient = await buildDummyClient();

  if (config.action === "delete") {
    const product = await dummyClient[objectType].delete(config.id);

    return {
      outcome: "executed",
      data: product,
      title: `✅ ${objectType} #${product.id} deleted`,
    };
  }

  const { mappings = [] } = config;

  if (config.action === "update") {
    const product = await dummyClient[objectType].update(
      config.id,
      Object.fromEntries(
        mappings.map((mapping) => [mapping.name, mapping.value]),
      ),
    );

    return {
      outcome: "executed",
      data: product,
      title: `✅ ${objectType} #${product.id} updated`,
    };
  }

  if (config.action === "insert") {
    const product = await dummyClient[objectType].create(
      Object.fromEntries(
        mappings.map((mapping) => [mapping.name, mapping.value]),
      ),
    );

    return {
      outcome: "executed",
      data: product,
      title: `✅ ${objectType} #${product.id} created`,
    };
  }

  throw new Error("Invalid");
};
