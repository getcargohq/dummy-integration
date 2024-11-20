/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/__tests__/*.test.ts"],
    passWithNoTests: true,
  },
});
