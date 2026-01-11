import { authenticate } from "./authenticate";
import { buildFetchProductsExtractor } from "./extractors/fetchProducts";
import { buildDeleteProductAction } from "./actions/deleteProduct";
import { buildGetProductAction } from "./actions/getProduct";
import { buildUpdateProductAction } from "./actions/updateProduct";
import { buildCreateProductAction } from "./actions/createProduct";
import { Integration } from "../types";
import { buildListProductPropertiesAutocomplete } from "./autocompletes/listProductProperties";
import { connectorConfigSchema } from "./dummy";

const svg = `
<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01v0a2.83 2.83 0 0 1 0-4L17 3"></path><path d="m16 2 6 6"></path><path d="M12 16H4"></path></svg>
`;

export const buildDummyIntegration = (): Integration => {
  return {
    name: "Dummy",
    url: "https://dummyjson.com",
    icon: svg,
    description: "Dummy integration",
    color: "#b6b7fd",
    connector: {
      config: {
        schema: connectorConfigSchema,
      },
    },
    actions: {
      getProduct: buildGetProductAction(),
      updateProduct: buildUpdateProductAction(),
      createProduct: buildCreateProductAction(),
      deleteProduct: buildDeleteProductAction(),
    },
    extractors: {
      fetchProducts: buildFetchProductsExtractor(),
    },
    dynamicSchemas: {},
    autocompletes: {
      listProductProperties: buildListProductPropertiesAutocomplete(),
    },
    authenticate: (payload) => authenticate(payload),
  };
};
