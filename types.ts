import type { Schema as JsonSchema } from "jsonschema";

export type IntegrationManifestRateLimit = {
  unit: "day" | "hour" | "minute" | "second";
  max: number;
};

export type IntegrationManifestRetry = {
  maximumAttempts?: number;
  initialInterval?: number;
  backoffCoefficient?: number;
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
  // to calculate the retry policy, you can use: https://temporal-time.netlify.app/
  retry?: IntegrationManifestRetry;
  executing?: {
    retry: IntegrationManifestRetry;
    withRateLimit: boolean;
  };
  children?: IntegrationManifestActionChild[];
};

export type IntegrationManifestModelMode =
  | {
      kind: "ingest";
    }
  | {
      kind: "fetch";
      autoRefetch: boolean;
      isIncremental: boolean;
      minIntervalInSeconds?: number;
    };

export type IntegrationManifestModelVariant = {
  condition?: {
    slugs: string[];
  };
  config: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
  retry?: IntegrationManifestRetry;
  fetching?: {
    retry: IntegrationManifestRetry;
    withRateLimit: boolean;
  };
  mode: IntegrationManifestModelMode;
  preview: "none" | "records" | "count";
};

export type IntegrationManifestModel = {
  slug: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
  variants: IntegrationManifestModelVariant[];
};

export type IntegrationManifest = {
  name: string;
  description: string;
  color: string;
  icon: string;
  url: string;
  autocompletes: {
    slug: string;
    params: {
      jsonSchema: JsonSchema;
    };
    cacheExpirationInSeconds?: number;
  }[];
  dynamicSchemas: {
    slug: string;
    params: {
      jsonSchema: JsonSchema;
    };
  }[];
  connector: {
    config: {
      jsonSchema: JsonSchema;
      uiSchema: Record<string, any>;
    };
    rateLimit?: IntegrationManifestRateLimit;
  };
  users?: {
    config: {
      jsonSchema: JsonSchema;
      uiSchema: Record<string, any>;
    };
  };
  model?: IntegrationManifestModel;
  actions: Record<string, IntegrationManifestAction>;
};

export type IntegrationConnector<Config> = {
  uuid: string;
  workspaceUuid: string;
  config: Config;
};

export type IntegrationAuthenticatePayload<ConnectorConfig = unknown> = {
  connector: IntegrationConnector<ConnectorConfig>;
};

export type IntegrationListUsersPayload<ConnectorConfig = unknown> = {
  connector: IntegrationConnector<ConnectorConfig>;
};

export type IntegrationAuthenticateResult =
  | {
      outcome: "success";
    }
  | {
      outcome: "error";
      reason: "unauthenticated";
      errorMessage?: string;
    };

export type IntegrationActionExecutePayload<
  ConnectorConfig = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  config: Config;
};

export type IntegrationActionExecuteResult =
  | {
      outcome: "executed";
      data?: Record<string, any>;
      title: string;
      iconUrl?: string;
      childIndex?: number;
    }
  | { outcome: "executing" };

export type IntegrationActionValidatePayload<Config = unknown> = {
  config: Config;
};

export type IntegrationActionValidateResult =
  | {
      outcome: "valid";
    }
  | { outcome: "notValid"; errorMessage: string };

export type IntegrationAutocompletePayload<
  ConnectorConfig = unknown,
  Slug = string,
  Params = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  slug: Slug;
  value?: any;
  params: Params;
};

export type IntegrationAutocompleteResult = {
  results: {
    label: string;
    value: string;
    parent?: string;
    description?: string;
    configOverride?: Record<string, any>;
  }[];
};

export type IntegrationGetDynamicSchemaPayload<
  ConnectorConfig = unknown,
  Slug = string,
  Params = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  slug: Slug;
  params: Params;
};

export type IntegrationGetDynamicSchemaResult = {
  jsonSchema: JsonSchema;
  uiSchema: Record<string, any>;
};

export type IntegrationCompleteOauthPayload<Params = unknown> = {
  params: Params;
};

export type IntegrationCompleteOauthResult = {
  value: string;
};

export type IntegrationColumnType =
  | "string"
  | "number"
  | "object"
  | "array"
  | "date"
  | "boolean"
  | "any";

export type IntegrationColumn = {
  slug: string;
  type: IntegrationColumnType;
  label: string;
  description?: string;
};

export type IntegrationModelCreatePayload<
  ConnectorConfig = unknown,
  Slug = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  slug: Slug;
  config: Config;
};

export type IntegrationModelUpdatePayload<
  ConnectorConfig = unknown,
  Slug = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  slug: Slug;
  config: Config;
};

export type IntegrationModelRemovePayload<
  ConnectorConfig = unknown,
  Slug = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  slug: Slug;
  config: Config;
};

export type IntegrationModelFetchPayload<
  ConnectorConfig = unknown,
  Slug = unknown,
  Config = unknown,
  Meta = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  slug: Slug;
  config: Config;
  meta?: Meta;
};

export type IntegrationModelCountPayload<
  ConnectorConfig = unknown,
  Slug = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  slug: Slug;
  config: Config;
};

export type IntegrationModelCreateResult<Config = unknown> = {
  config: Config;
};

export type IntegrationModelUpdateResult<Config = unknown> = {
  config: Config;
};

export type IntegrationModelRecord = {
  action: "insert" | "update" | "upsert" | "remove";
  override: boolean;
  record: Record<string, any>;
};

export type IntegrationModelFetchResult<Meta = unknown> =
  | {
      outcome: "fetched";
      columns: IntegrationColumn[];
      idColumnSlug: string;
      titleColumnSlug: string;
      timeColumnSlug?: string;
      count?: number;
      data: {
        kind: "records";
        records: IntegrationModelRecord[];
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
      data: {
        meta?: Meta;
      };
    };

export type IntegrationModelCountResult = {
  count: number;
};

export type IntegrationUser = {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  profileImage?: string | undefined;
};

export type IntegrationAction = {
  validate: (
    payload: IntegrationActionValidatePayload<any>,
  ) => Promise<IntegrationActionValidateResult>;
  execute: (
    payload: IntegrationActionExecutePayload<any, any>,
  ) => Promise<IntegrationActionExecuteResult>;
};

export type Integration = {
  manifest: IntegrationManifest;
  authenticate: (
    payload: IntegrationAuthenticatePayload<any>,
  ) => Promise<IntegrationAuthenticateResult>;
  actions: Record<string, IntegrationAction>;
  listUsers?: (
    payload: IntegrationListUsersPayload<any>,
  ) => Promise<IntegrationUser[]>;
  model?: {
    fetch: (
      payload: IntegrationModelFetchPayload<any, any, any, any>,
    ) => Promise<IntegrationModelFetchResult<any>>;
    count?: (
      payload: IntegrationModelCountPayload<any, any, any>,
    ) => Promise<IntegrationModelCountResult>;
  };
  autocomplete?: (
    payload: IntegrationAutocompletePayload<any, any, any>,
  ) => Promise<IntegrationAutocompleteResult>;
  getDynamicSchema?: (
    payload: IntegrationGetDynamicSchemaPayload<any, any, any>,
  ) => Promise<IntegrationGetDynamicSchemaResult>;
  completeOauth?: (
    payload: IntegrationCompleteOauthPayload<any>,
  ) => Promise<IntegrationCompleteOauthResult>;
};
