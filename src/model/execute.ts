import {
  IntegrationModelExecutePayload,
  IntegrationModelExecuteResult,
} from "../../types";
import { buildDummyClient } from "../client";
import { ConnectorConfig, ModelConfig, ModelMeta, ModelSlug } from "../dummy";
import { productColumns } from "../schemas/product";

const LIMIT = 30;

export type ModelExecutePayload = IntegrationModelExecutePayload<
  ConnectorConfig,
  ModelSlug,
  ModelConfig,
  ModelMeta
>;

export type ModelExecuteResult = IntegrationModelExecuteResult<ModelMeta>;

export const modelExecute = async (
  payload: ModelExecutePayload,
): Promise<ModelExecuteResult> => {
  const { slug, meta = { offset: 0 } } = payload;

  const dummyClient = buildDummyClient();

  if (slug === "product") {
    const { products } = await dummyClient.product.list({
      limit: LIMIT,
      offset: meta.offset,
      sortBy: "id",
      order: "asc",
    });

    return {
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
  }

  throw new Error("Invalid slug");
};
