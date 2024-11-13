import { z } from "zod";
import { reshapeZodSchemaToColumnType, sentenceCase } from "../../utils";

export const zodProduct = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
});

export type Product = z.infer<typeof zodProduct>;

export const productColumns = Object.entries(zodProduct.shape).map(
  ([key, schema]) => ({
    slug: key,
    type: reshapeZodSchemaToColumnType(schema),
    label: sentenceCase(key),
  }),
);

export const zodProductColumnSlugs = z.enum(
  productColumns.map((column) => column.slug) as [string, ...string[]],
);
