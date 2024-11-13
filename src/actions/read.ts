import { ConnectorConfig, ReadActionConfig } from "../dummy";
import { buildDummyClient } from "../client";
import {
  IntegrationActionExecutePayload,
  IntegrationActionExecuteResult,
} from "../../types";

export type ReadActionPayload = IntegrationActionExecutePayload<
  ConnectorConfig,
  ReadActionConfig
>;

export type ReadActionResult = IntegrationActionExecuteResult;

export const readAction = async (
  payload: ReadActionPayload,
): Promise<ReadActionResult> => {
  const { config } = payload;

  const dummyClient = buildDummyClient();

  const { objectType, id } = config;

  const product = await dummyClient[objectType].get(id);

  return {
    outcome: "executed",
    data: product,
    title:
      product === undefined
        ? `❌ ${objectType} not found`
        : `✅ ${objectType} found`,
  };
};
