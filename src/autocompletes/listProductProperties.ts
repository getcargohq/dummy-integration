import {
  IntegrationAutocomplete,
  IntegrationAutocompleteGetPayload,
} from "../../types";
import { z } from "zod/v4";
import { productColumns } from "../schemas/product";

const paramsSchema = z.object({});

export const buildListProductPropertiesAutocomplete =
  (): IntegrationAutocomplete => {
    return {
      params: {
        schema: paramsSchema,
      },
      get: async (
        _payload: IntegrationAutocompleteGetPayload<
          z.infer<typeof paramsSchema>
        >,
      ) => {
        return {
          results: productColumns.map((column) => {
            return {
              value: column.slug,
              label: column.label,
            };
          }),
        };
      },
    };
  };
