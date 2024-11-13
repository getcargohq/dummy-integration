import { ConnectorConfig } from "./dummy";
import { buildDummyClient } from "./client";
import {
  IntegrationAuthenticatePayload,
  IntegrationAuthenticateResult,
} from "../types";

export type AuthenticatePayload =
  IntegrationAuthenticatePayload<ConnectorConfig>;
export type AuthenticateResult = IntegrationAuthenticateResult;

export const authenticate = async (
  payload: AuthenticatePayload,
): Promise<AuthenticateResult> => {
  const dummyClient = buildDummyClient();

  const isAuthenticated = await dummyClient.isAuthenticated();

  if (isAuthenticated === false) {
    return {
      outcome: "error",
      reason: "unauthenticated",
    };
  }

  return {
    outcome: "success",
  };
};
