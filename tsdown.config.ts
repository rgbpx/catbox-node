import { defineConfig } from "tsdown";

export default defineConfig({
  attw: {
    enabled: true,
    level: "error",
    profile: "node16",
  },
  entry: {
    index: "./src/index.ts",
  },
  exports: true,
  dts: true,
  hash: false,
  failOnWarn: true,
  suppressWarnings: ["does not yet have a stable API"],
  format: ["cjs", "esm"],
  minify: true,
  platform: "node",
  publint: {
    enabled: true,
    strict: true,
    level: "warning",
  },
  tsconfig: "./tsconfig.build.json",
});
