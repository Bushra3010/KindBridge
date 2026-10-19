import { defineConfig } from "vitest/config";
import path from "node:path";

// Pure regression tests: no database setup or fixture resets.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["tests/reconcile.test.ts", "tests/signup-otp.test.ts"] },
});
