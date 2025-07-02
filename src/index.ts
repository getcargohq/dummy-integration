import { manifest } from "./manifest";
import { authenticate } from "./authenticate";
import { modelFetch } from "./model/fetch";
import { zodReadActionConfig, zodWriteActionConfig } from "./dummy";
import { writeAction } from "./actions/write";
import { readAction } from "./actions/read";
import { validateAction } from "../utils";
import { Integration } from "../types";
import { autocomplete } from "./autocomplete";

export const buildDummyIntegration = (): Integration => {
  return {
    manifest,
    actions: {
      write: {
        execute: (payload) => writeAction(payload),
        validate: async (payload) =>
          validateAction(payload.config, zodWriteActionConfig),
      },
      read: {
        execute: (payload) => readAction(payload),
        validate: async (payload) =>
          validateAction(payload.config, zodReadActionConfig),
      },
    },
    autocomplete: (payload) => autocomplete(payload),
    model: {
      fetch: (payload) => modelFetch(payload),
    },
    authenticate: (payload) => authenticate(payload),
  };
};
