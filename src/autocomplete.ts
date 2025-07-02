import {
  IntegrationAutocompletePayload,
  IntegrationAutocompleteResult,
} from "../types";
import { ConnectorConfig } from "./dummy";
import { productColumns } from "./schemas/product";

export type AutocompletePayload = IntegrationAutocompletePayload<
  ConnectorConfig,
  "listObjectProperties",
  { objectType: string }
>;

export const autocomplete = async (
  payload: AutocompletePayload,
): Promise<IntegrationAutocompleteResult> => {
  if (payload.slug === "listObjectProperties") {
    const { objectType } = payload.params;

    if (objectType === "product") {
      return {
        results: productColumns.map((column) => {
          return {
            value: column.slug,
            label: column.label,
          };
        }),
      };
    }
  }

  return { results: [] };
};
