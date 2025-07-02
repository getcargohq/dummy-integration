import type { Schema as JsonSchema } from "jsonschema";

export type RateLimit = {
  unit: "day" | "hour" | "minute" | "second";
  max: number;
};

export type IntegrationRateLimit = RateLimit & {
  config: {
    jsonSchema: JsonSchema;
  };
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
  rateLimits?: IntegrationRateLimit[];
  isSerialized?: boolean;
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
      autoIngest?: boolean;
    }
  | {
      kind: "fetch";
      isIncremental: boolean;
      minIntervalInSeconds?: number;
      autoFetch?: boolean;
    };

export type IntegrationManifestModelVariant = {
  condition?: {
    slugs: string[];
  };
  config: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
  rateLimits?: IntegrationRateLimit[];
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

export type IntegrationManifestAgentDeployment = {
  description: string;
  config: {
    jsonSchema: JsonSchema;
    uiSchema: Record<string, any>;
  };
};

export type IntegrationManifest = {
  name: string;
  description: string;
  icon: string;
  color: string;
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
    rateLimit?: RateLimit;
    config: {
      jsonSchema: JsonSchema;
      uiSchema: Record<string, any>;
    };
    caching?: {
      isCompatible?: boolean;
    };
  };
  users?: {
    config: {
      jsonSchema: JsonSchema;
      uiSchema: Record<string, any>;
    };
  };
  model?: IntegrationManifestModel;
  actions: Record<string, IntegrationManifestAction>;
  agent?: { deployment: IntegrationManifestAgentDeployment };
};

export type IntegrationConnector<Config> = {
  uuid: string;
  workspaceUuid: string;
  config: Config;
};

export type IntegrationAgent<DeploymentConfig> = {
  uuid: string;
  workspaceUuid: string;
  deployments: { config: DeploymentConfig }[];
  name: string;
  icon: {
    color: "grey" | "green" | "purple" | "yellow" | "blue" | "red";
  };
};

export type IntegrationAgentAttachment = {
  s3Filename: string;
  name: string;
  contentType: string;
};

export type IntegrationAgentMessage<MessageMeta> = {
  text: string;
  userUuid?: string;
  attachments: IntegrationAgentAttachment[];
  meta: MessageMeta;
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
      config?: Record<string, unknown>;
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
  | "vector"
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

export type IntegrationModelPausePayload<
  ConnectorConfig = unknown,
  Slug = unknown,
  Config = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  uuid: string;
  slug: Slug;
  config: Config;
};

export type IntegrationModelResumePayload<
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
  isDryFetch?: boolean;
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

export type IntegrationModelCreateResult<Config = unknown> =
  | {
      outcome: "created";
      config: Config;
    }
  | { outcome: "notCreated"; errorMessage: string };

export type IntegrationModelUpdateResult<Config = unknown> =
  | {
      outcome: "updated";
      config: Config;
    }
  | { outcome: "notUpdated"; errorMessage: string };

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
      data:
        | {
            kind: "command";
            command: string;
            materialization: "table" | "view";
          }
        | {
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
      data:
        | {
            kind: "command";
          }
        | {
            kind: "records";
            meta?: Meta;
          };
    };

export type IntegrationModelCountResult = {
  count: number;
};

export type IntegrationAgentFindChatPayload<
  ConnectorConfig = unknown,
  AgentDeploymentConfig = unknown,
  Event = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  agent: IntegrationAgent<AgentDeploymentConfig>;
  event: Event;
};

export type IntegrationAgentFindChatResult<Meta = unknown> =
  | {
      outcome: "found";
      agentUuid: string;
      slug: string;
      meta: Meta;
    }
  | {
      outcome: "notFound";
    };

export type IntegrationAgentRetrieveMessagesPayload<
  ConnectorConfig = unknown,
  AgentDeploymentConfig = unknown,
  Event = unknown,
> = {
  isNewChat: boolean;
  connector: IntegrationConnector<ConnectorConfig>;
  agent: IntegrationAgent<AgentDeploymentConfig>;
  event: Event;
};

export type IntegrationAgentRetrieveMessagesResult<MessageMeta = unknown> =
  | {
      outcome: "retrieved";
      messages: IntegrationAgentMessage<MessageMeta>[];
    }
  | {
      outcome: "notRetrieved";
    };

export type IntegrationAgentHandleMessagePayload<
  ConnectorConfig = unknown,
  AgentDeploymentConfig = unknown,
  Meta = unknown,
  ChatMeta = unknown,
> = {
  connector: IntegrationConnector<ConnectorConfig>;
  agent: IntegrationAgent<AgentDeploymentConfig>;
  meta: Meta | null;
  chat: {
    meta: ChatMeta;
  };
  text: string;
};

export type IntegrationAgentHandleMessageResult<Meta = unknown> = {
  meta: Meta;
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
    create?: (
      payload: IntegrationModelCreatePayload<any, any, any>,
    ) => Promise<IntegrationModelCreateResult<any>>;
    update?: (
      payload: IntegrationModelUpdatePayload<any, any, any>,
    ) => Promise<IntegrationModelUpdateResult<any>>;
    remove?: (
      payload: IntegrationModelRemovePayload<any, any, any>,
    ) => Promise<void>;
    pause?: (
      payload: IntegrationModelPausePayload<any, any, any>,
    ) => Promise<void>;
    resume?: (
      payload: IntegrationModelResumePayload<any, any, any>,
    ) => Promise<void>;
  };
  agent?: {
    findChat: (
      payload: IntegrationAgentFindChatPayload<any, any, any>,
    ) => Promise<IntegrationAgentFindChatResult<any>>;
    retrieveMessages: (
      payload: IntegrationAgentRetrieveMessagesPayload<any, any, any>,
    ) => Promise<IntegrationAgentRetrieveMessagesResult<any>>;
    handleMessage: (
      payload: IntegrationAgentHandleMessagePayload<any, any, any, any>,
    ) => Promise<IntegrationAgentHandleMessageResult<any>>;
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
