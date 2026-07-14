import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["**/*.js"],
      exclude: ["node_modules/**", "tests/**", "coverage/**", "*.config.js", "eslint.config.js"],
    },
  },
});
