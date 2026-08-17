import { resolve } from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          bail: 1,
          alias: {
            "@src": resolve("./src"),
          },
          include: ["./tests/unit/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          env: loadEnv(mode, process.cwd(), ""),
          alias: {
            "@src": resolve("./src"),
          },
          include: ["./tests/integration/**/*.integration.test.ts"],
          testTimeout: 10_000,
        },
      },
    ],
  },
}));
