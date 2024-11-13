import { z } from "zod";
import { zodProductColumnSlugs } from "./schemas/product";

export const zodConnectorConfig = z.object({});
export type ConnectorConfig = z.infer<typeof zodConnectorConfig>;

export const zodReadActionConfig = z.object({
  objectType: z.literal("product"),
  id: z.union([z.string(), z.number()]),
});

export type ReadActionConfig = z.infer<typeof zodReadActionConfig>;

export const zodWriteActionConfig = z.union([
  z.object({
    objectType: z.literal("product"),
    action: z.literal("insert"),
    mappings: z
      .array(
        z.object({
          name: zodProductColumnSlugs,
          value: z.any(),
        }),
      )
      .optional(),
  }),
  z.object({
    objectType: z.literal("product"),
    action: z.literal("update"),
    id: z.union([z.string(), z.number()]),
    mappings: z
      .array(
        z.object({
          name: zodProductColumnSlugs,
          value: z.any(),
        }),
      )
      .optional(),
  }),
  z.object({
    objectType: z.literal("product"),
    action: z.literal("delete"),
    id: z.union([z.string(), z.number()]),
  }),
]);

export type WriteActionConfig = z.infer<typeof zodWriteActionConfig>;

export const zodModelSlug = z.literal("product");
export type ModelSlug = z.infer<typeof zodModelSlug>;

export const zodModelConfig = z.object({});
export type ModelConfig = z.infer<typeof zodModelConfig>;

export const zodRecordsExtratorMeta = z.object({
  offset: z.number(),
});
export type ModelMeta = z.infer<typeof zodRecordsExtratorMeta>;
