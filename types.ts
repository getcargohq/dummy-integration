import type { Schema as JsonSchema } from "jsonschema";
import { z } from "zod/v4";

// COMMON

export type IntegrationRateLimit = {
  unit: "day" | "hour" | "minute" | "second";
  max: number;
};

export type IntegrationRateLimitWithConfig = IntegrationRateLimit & {
  config: {
    jsonSchema: JsonSchema;
  };
};

export type IntegrationRetry = {
  maximumAttempts?: number;
  initialInterval?: number;
  backoffCoefficient?: number;
};

export type IntegrationColumnType =
  | "string"
  | "number"
  | "object"
  | "array"
  | "date"
  | "boolean"
  | "vector"
  | "any";

export type IntegrationColumn = {
  slug: string;
  type: IntegrationColumnType;
  label: string;
  description?: string;
};

export type IntegrationConnector<Config> = {
  uuid: string;
  workspaceUuid: string;
  config: Config;
};

// AUTOCOMPLETE

export type IntegrationAutocompleteGetPayload<
  ConnectorConfig = unknown,
  Params = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  value?: any;
  params: Params;
};

export type IntegrationAutocompleteGetResult = {
  results: {
    label: string;
    value: string;
    parent?: string;
    description?: string;
    configOverride?: Record<string, any>;
  }[];
};

export type IntegrationAutocomplete = {
  params: {
    schema: z.ZodTypeAny;
  };
  cacheExpirationInSeconds?: number;
  get: (
    payload: IntegrationAutocompleteGetPayload<any, any>,
  ) => Promise<IntegrationAutocompleteGetResult>;
};

// DYNAMIC SCHEMA

export type IntegrationDynamicSchemaGetPayload<
  ConnectorConfig = unknown,
  Params = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  params: Params;
};

export type IntegrationDynamicSchemaGetResult = {
  jsonSchema: JsonSchema;
  uiSchema: Record<string, any>;
};

export type IntegrationDynamicSchema = {
  params: {
    schema: z.ZodTypeAny;
  };
  get: (
    payload: IntegrationDynamicSchemaGetPayload<any, any>,
  ) => Promise<IntegrationDynamicSchemaGetResult>;
};

// OAUTH

export type IntegrationCompleteOauthPayload<Params = unknown> = {
  params: Params;
};

export type IntegrationCompleteOauthResult = {
  value: string;
};

// AUTHENTICATE

export type IntegrationAuthenticatePayload<ConnectorConfig = unknown> = {
  connector: IntegrationConnector<ConnectorConfig>;
};

export type IntegrationAuthenticateResult =
  | {
      outcome: "success";
      config?: Record<string, unknown>;
    }
  | {
      outcome: "error";
      reason: "unauthenticated";
      errorMessage?: string;
    };

// USER

export type IntegrationListUsersPayload<ConnectorConfig = unknown> = {
  connector: IntegrationConnector<ConnectorConfig>;
};

export type IntegrationUser = {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  profileImage?: string | undefined;
};

// ACTION

export type IntegrationActionExecutePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  config: Config;
  isDryExecution?: boolean;
};

export type IntegrationActionExecuteResult =
  | {
      outcome: "executed";
      data?: Record<string, any>;
      unitsCount?: number;
      title: string;
      iconUrl?: string;
      childIndex?: number;
    }
  | { outcome: "executing" };

export type IntegrationAction = {
  name: string;
  description: string;
  config: {
    schema: z.ZodTypeAny;
    uiSchema: Record<string, any>;
  };
  rateLimits?: IntegrationRateLimitWithConfig[];
  isSerialized?: boolean;
  retry?: IntegrationRetry;
  executing?: {
    retry: IntegrationRetry;
    withRateLimit: boolean;
  };
  execute: (
    payload: IntegrationActionExecutePayload<any, any>,
  ) => Promise<IntegrationActionExecuteResult>;
};

// EXTRACTOR

export type IntegrationExtractorMode =
  | {
      kind: "ingest";
      autoIngest?: boolean;
    }
  | {
      kind: "fetch";
      isIncremental: boolean;
      minIntervalInSeconds?: number;
      autoFetch?: boolean;
    };

export type IntegrationExtractorCreatePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  config: Config;
};

export type IntegrationExtractorUpdatePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  config: Config;
};

export type IntegrationExtractorRemovePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  config: Config;
};

export type IntegrationExtractorPausePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  config: Config;
};

export type IntegrationExtractorResumePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  config: Config;
};

export type IntegrationExtractorFetchPayload<
  ConnectorConfig = unknown,
  Config = unknown,
  Meta = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  config: Config;
  meta?: Meta;
  isDryFetch?: boolean;
};

export type IntegrationExtractorCountPayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  config: Config;
};

export type IntegrationExtractorCreateResult<Config = unknown> =
  | {
      outcome: "created";
      config: Config;
    }
  | { outcome: "notCreated"; errorMessage: string };

export type IntegrationExtractorUpdateResult<Config = unknown> =
  | {
      outcome: "updated";
      config: Config;
    }
  | { outcome: "notUpdated"; errorMessage: string };

export type IntegrationExtractorRecord = {
  kind?: "removed" | "updated" | "added";
  override: boolean;
  record: Record<string, any>;
};

export type IntegrationExtractorFetchResult<Meta = unknown> =
  | {
      outcome: "fetched";
      columns: IntegrationColumn[];
      idColumnSlug: string;
      titleColumnSlug: string;
      timeColumnSlug?: string;
      count?: number;
      data:
        | {
            kind: "command";
            command: string;
            materialization: "table" | "view";
          }
        | {
            kind: "records";
            records: IntegrationExtractorRecord[];
            hasMore: boolean;
            meta?: Meta;
          };
    }
  | {
      outcome: "fetching";
      columns: IntegrationColumn[];
      idColumnSlug: string;
      titleColumnSlug: string;
      timeColumnSlug?: string;
      data:
        | {
            kind: "command";
          }
        | {
            kind: "records";
            meta?: Meta;
          };
    };

export type IntegrationExtractorCountResult = {
  count: number;
};

export type IntegrationExtractor = {
  name: string;
  description: string;
  config: {
    schema: z.ZodTypeAny;
    uiSchema: Record<string, any>;
  };
  rateLimits?: IntegrationRateLimitWithConfig[];
  retry?: IntegrationRetry;
  fetching?: {
    retry: IntegrationRetry;
    withRateLimit: boolean;
  };
  mode: IntegrationExtractorMode;
  preview: "none" | "records" | "count";
  fetch: (
    payload: IntegrationExtractorFetchPayload<any, any, any>,
  ) => Promise<IntegrationExtractorFetchResult<any>>;
  count?: (
    payload: IntegrationExtractorCountPayload<any, any>,
  ) => Promise<IntegrationExtractorCountResult>;
};

export type Integration = {
  name: string;
  url: string;
  icon: string;
  description: string;
  color: string;
  connector: {
    rateLimit?: IntegrationRateLimit;
    config: {
      schema: z.ZodTypeAny;
      uiSchema: Record<string, any>;
    };
    caching?: {
      isCompatible: boolean;
    };
  };
  authenticate: (
    payload: IntegrationAuthenticatePayload<any>,
  ) => Promise<IntegrationAuthenticateResult>;
  actions: Record<string, IntegrationAction>;
  extractors: Record<string, IntegrationExtractor>;
  dynamicSchemas: Record<string, IntegrationDynamicSchema>;
  autocompletes: Record<string, IntegrationAutocomplete>;
  listUsers?: (
    payload: IntegrationListUsersPayload<any>,
  ) => Promise<IntegrationUser[]>;
  completeOauth?: (
    payload: IntegrationCompleteOauthPayload<any>,
  ) => Promise<IntegrationCompleteOauthResult>;
};

// MANIFEST

export type IntegrationManifestConnector = {
  rateLimit?: IntegrationRateLimit;
  config: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
  caching?: {
    isCompatible?: boolean;
  };
};

export type IntegrationManifestActionChild = {
  text: string;
};

export type IntegrationManifestAction = {
  name: string;
  description: string;
  config: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
  rateLimits?: IntegrationRateLimitWithConfig[];
  isSerialized?: boolean;
  retry?: IntegrationRetry;
  executing?: {
    retry: IntegrationRetry;
    withRateLimit: boolean;
  };
  children?: IntegrationManifestActionChild[];
};

export type IntegrationManifestExtractor = {
  name: string;
  description: string;
  config: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
  rateLimits?: IntegrationRateLimitWithConfig[];
  retry?: IntegrationRetry;
  fetching?: {
    retry: IntegrationRetry;
    withRateLimit: boolean;
  };
  mode: IntegrationExtractorMode;
  preview: "none" | "records" | "count";
};

export type IntegrationManifestDynamicSchema = {
  params: {
    jsonSchema: JsonSchema;
  };
};

export type IntegrationManifestAutocomplete = {
  params: {
    jsonSchema: JsonSchema;
  };
  cacheExpirationInSeconds?: number;
};

export type IntegrationManifest = {
  name: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  connector: IntegrationManifestConnector;
  actions: Record<string, IntegrationManifestAction>;
  extractors: Record<string, IntegrationManifestExtractor>;
  dynamicSchemas: Record<string, IntegrationManifestDynamicSchema>;
  autocompletes: Record<string, IntegrationManifestAutocomplete>;
};
