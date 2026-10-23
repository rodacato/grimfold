import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.e2e.ts"],
    testTimeout: 180_000,
    hookTimeout: 60_000,
  },
});
