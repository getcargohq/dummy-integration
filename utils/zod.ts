import z, { ZodIssue } from "zod";
import { IntegrationActionValidateResult } from "../types";
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

export const stringifyZodIssues = (issues: ZodIssue[]): string => {
  return issues
    .map((issue) => {
      if (issue.code === "invalid_type") {
        return `${issue.path.join(".")} is expected to be a ${
          issue.expected
        } but received a ${issue.received}`;
      }

      if (issue.code === "invalid_union") {
        return stringifyZodIssues(issue.unionErrors[0].issues);
      }

      return `${issue.path.join(".")} is not valid`;
    })
    .join(", ");
};

export const validateAction = <T extends z.ZodType>(
  config: Record<string, any>,
  schema: T,
): IntegrationActionValidateResult => {
  const parsedConfig = schema.safeParse(config);

  if (parsedConfig.success === true) {
    return {
      outcome: "valid",
    };
  }

  return {
    outcome: "notValid",
    errorMessage: stringifyZodIssues(parsedConfig.error.errors),
  };
};
