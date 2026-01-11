import {
  IntegrationExtractor,
  IntegrationExtractorFetchPayload,
  IntegrationExtractorFetchResult,
} from "../../types";
import { buildDummyClient } from "../client";
import { connectorConfigSchema } from "../dummy";
import { productColumns } from "../schemas/product";
import { z } from "zod/v4";

const LIMIT = 30;

const configSchema = z.object({});
const metaSchema = z.object({
  offset: z.number(),
});

export const buildFetchProductsExtractor = (): IntegrationExtractor => {
  return {
    name: "Fetch Products",
    description: "Fetch products",
    config: {
      schema: configSchema,
    },
    mode: {
      kind: "fetch",
      autoFetch: true,
      isIncremental: false,
      minIntervalInSeconds: 30 * 60, // 30min
    },
    preview: "records",
    fetch: async (
      payload: IntegrationExtractorFetchPayload<
        z.infer<typeof connectorConfigSchema>,
        z.infer<typeof configSchema>,
        z.infer<typeof metaSchema>
      >,
    ): Promise<IntegrationExtractorFetchResult> => {
      const { meta = { offset: 0 } } = payload;

      const dummyClient = buildDummyClient();

      const { products } = await dummyClient.product.list({
        limit: LIMIT,
        offset: meta.offset,
        sortBy: "id",
        order: "asc",
      });

      return {
        outcome: "fetched",
        columns: productColumns,
        idColumnSlug: "id",
        titleColumnSlug: "id",
        data: {
          kind: "records",
          records: products.map((product) => {
            return {
              action: "upsert",
              override: true,
              record: product,
            };
          }),
          hasMore: products.length > 0,
          meta:
            products.length > 0
              ? { offset: meta.offset + products.length }
              : undefined,
        },
      };
    },
  };
};
