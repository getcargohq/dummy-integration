import { buildDummyClient } from "./client";
import {
  IntegrationAuthenticatePayload,
  IntegrationAuthenticateResult,
} from "../types";
import { connectorConfigSchema } from "./dummy";
import { z } from "zod/v4";

export type AuthenticatePayload = IntegrationAuthenticatePayload<
  z.infer<typeof connectorConfigSchema>
>;
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
