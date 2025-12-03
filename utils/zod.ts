import { IntegrationColumnType } from "../types";

export const reshapeZodSchemaToColumnType = (
  schema: Zod.ZodType,
): IntegrationColumnType => {
  const def: any = schema._def;
  const type: any =
    def.innerType?._def?.innerType?._def?.typeName ||
    def.innerType?._def?.typeName ||
    def.typeName;

  if (type === "ZodNumber") {
    return "number";
  }

  if (type === "ZodString") {
    return "string";
  }

  if (type === "ZodEnum") {
    return "string";
  }

  if (type === "ZodArray") {
    return "array";
  }

  if (type === "ZodDate") {
    return "date";
  }

  if (type === "ZodBoolean") {
    return "boolean";
  }

  return "object";
};
