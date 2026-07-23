import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
          alias: {
            "@src": resolve("./src"),
          },
          include: ["./tests/integration/**/*.integration.test.ts"],
          testTimeout: 10_000,
        },
      },
    ],
  },
});
