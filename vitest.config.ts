import { defineConfig } from "vitest/config";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(__dirname);

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? "" },
    fileParallelism: false,
    // Remote Postgres: the exchange flows make dozens of round trips each.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
