import axios from "axios";
import { Product, zodProduct } from "./schemas/product";
import { z } from "zod";

const BASE_URL = "https://dummyjson.com";

export type DummyClient = {
  isAuthenticated: () => Promise<boolean>;
  product: {
    list: (payload: {
      limit: number;
      offset: number;
      sortBy: "id" | "title" | "price";
      order: "desc" | "asc";
    }) => Promise<{ products: Product[] }>;
    get: (id: string) => Promise<Product | undefined>;
    create: (
      properties: Partial<Record<keyof Product, any>>,
    ) => Promise<Product>;
    update: (
      id: string,
      properties: Partial<Record<keyof Product, any>>,
    ) => Promise<Product>;
    delete: (id: string) => Promise<Product>;
  };
};

export const buildDummyClient = (): DummyClient => {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  return {
    isAuthenticated: async (): Promise<boolean> => {
      return true;
    },
    product: {
      list: async (payload) => {
        const { data } = await client.get("/products", {
          params: payload,
        });

        const parsedData = z
          .object({ products: z.array(zodProduct) })
          .safeParse(data);

        if (parsedData.success === false) {
          throw new Error("Invalid products");
        }

        return parsedData.data;
      },
      get: async (id) => {
        try {
          const { data } = await client.get(`/products/${id}`);

          const parsedData = zodProduct.safeParse(data);

          if (parsedData.success === false) {
            throw new Error("Invalid product");
          }

          return parsedData.data;
        } catch (error: any) {
          if (error.statusCode === 404) {
            return undefined;
          }

          throw error;
        }
      },
      create: async (properties) => {
        const { data } = await client.post("/products/add", properties);

        const parsedData = zodProduct.safeParse(data);

        if (parsedData.success === false) {
          throw new Error("Invalid product");
        }

        return parsedData.data;
      },
      update: async (id, properties) => {
        const { data } = await client.patch(`/products/${id}`, properties);

        const parsedData = zodProduct.safeParse(data);

        if (parsedData.success === false) {
          throw new Error("Invalid product");
        }

        return parsedData.data;
      },
      delete: async (id) => {
        const { data } = await client.delete(`/products/${id}`);

        const parsedData = zodProduct.safeParse(data);

        if (parsedData.success === false) {
          throw new Error("Invalid product");
        }

        return parsedData.data;
      },
    },
  };
};
