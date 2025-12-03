import { manifest } from "./manifest";
import { authenticate } from "./authenticate";
import { modelFetch } from "./model/fetch";
import { zodReadActionConfig, zodWriteActionConfig } from "./dummy";
import { writeAction } from "./actions/write";
import { readAction } from "./actions/read";
import { Integration } from "../types";
import { autocomplete } from "./autocomplete";

export const buildDummyIntegration = (): Integration => {
  return {
    manifest,
    actions: {
      write: {
        config: {
          schema: zodWriteActionConfig,
        },
        execute: (payload) => writeAction(payload),
      },
      read: {
        config: {
          schema: zodReadActionConfig,
        },
        execute: (payload) => readAction(payload),
      },
    },
    autocomplete: (payload) => autocomplete(payload),
    model: {
      fetch: (payload) => modelFetch(payload),
    },
    authenticate: (payload) => authenticate(payload),
  };
};
