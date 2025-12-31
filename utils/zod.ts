import { IntegrationColumnType } from "../types";
import { z } from "zod/v4";

export const reshapeZodSchemaToColumnType = (
  schema: z.ZodType,
): IntegrationColumnType => {
  const typeName = schema.def.type;

  // Unwrap nullable types
  if (typeName === "nullable" || typeName === "optional") {
    const innerSchema = (schema.def as unknown as { innerType: z.ZodType })
      .innerType;

    return reshapeZodSchemaToColumnType(innerSchema);
  }

  if (typeName === "number" || typeName === "int" || typeName === "bigint") {
    return "number";
  }

  if (typeName === "string" || typeName === "literal") {
    return "string";
  }

  if (typeName === "enum") {
    return "string";
  }

  if (typeName === "array") {
    return "array";
  }

  if (typeName === "date") {
    return "date";
  }

  if (typeName === "boolean") {
    return "boolean";
  }

  return "object";
};
