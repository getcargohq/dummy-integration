import { IntegrationManifest } from "../types";
import { productColumns } from "./schemas/product";

const svg = `
<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01v0a2.83 2.83 0 0 1 0-4L17 3"></path><path d="m16 2 6 6"></path><path d="M12 16H4"></path></svg>
`;

export const manifest: IntegrationManifest = {
  name: "Dummy",
  url: "https://dummyjson.com",
  icon: svg,
  description: "Dummy integration",
  color: "#b6b7fd",
  autocompletes: [],
  dynamicSchemas: [],
  connector: {
    config: {
      jsonSchema: {
        type: "object",
      },
      uiSchema: {},
    },
  },
  actions: {
    read: {
      name: "Read",
      description: "Read an object",
      config: {
        jsonSchema: {
          type: "object",
          properties: {
            objectType: {
              title: "Object type",
              type: "string",
              oneOf: [{ const: "product", title: "Product" }],
            },
            id: {
              $ref: "#/definitions/expression",
              title: "ID",
            },
          },
          required: ["objectType", "id"],
        },
        uiSchema: {
          id: {
            "ui:widget": "ExpressionWidget",
          },
        },
      },
    },
    write: {
      name: "Write",
      description: "Perform action on an object",
      config: {
        jsonSchema: {
          type: "object",
          properties: {
            objectType: {
              title: "Object type",
              type: "string",
              oneOf: [{ const: "product", title: "Product" }],
            },
            action: {
              title: "Action",
              type: "string",
              oneOf: [
                { const: "insert", title: "Insert" },
                { const: "update", title: "Update" },
                { const: "delete", title: "Delete" },
              ],
            },
          },
          allOf: [
            {
              if: {
                properties: {
                  action: {
                    anyOf: [{ const: "update" }, { const: "delete" }],
                  },
                },
              },
              then: {
                properties: {
                  id: {
                    $ref: "#/definitions/expression",
                    title: "ID",
                  },
                },
                required: ["id"],
              },
              else: {},
            },
            {
              if: {
                properties: {
                  action: {
                    const: "delete",
                  },
                },
              },
              then: {},
              else: {
                properties: {
                  mappings: {
                    title: "Mappings",
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          title: "Name",
                          type: "string",
                          anyOf: productColumns.map((column) => {
                            return { const: column.slug, title: column.label };
                          }),
                        },
                        value: {
                          $ref: "#/definitions/expression",
                          title: "Value",
                        },
                      },
                      required: ["name", "value"],
                    },
                  },
                },
              },
            },
          ],
          required: ["objectType", "action"],
        },
        uiSchema: {
          mappings: {
            items: {
              value: {
                "ui:widget": "ExpressionWidget",
              },
            },
          },
        },
      },
    },
  },
  model: {
    slug: {
      jsonSchema: {
        title: "Object type",
        type: "string",
        oneOf: [{ const: "product", title: "Product" }],
      },
      uiSchema: {},
    },
    variants: [
      {
        config: {
          jsonSchema: { type: "object" },
          uiSchema: {},
        },
        mode: {
          kind: "fetch",
          autoRefetch: true,
          isIncremental: false,
          minIntervalInSeconds: 30 * 60, // 30min
        },
        preview: "records",
      },
    ],
  },
};
