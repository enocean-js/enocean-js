import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run tests from all packages in the monorepo
    include: ["packages/**/*.test.js"],
    // Enable global APIs (describe, it, expect) like in Mocha/Jest
    globals: true,
    coverage: {
      // Use the v8 provider for coverage
      provider: "v8",
      // Specify which files to include in the coverage report
      include: ["packages/**/*.js"],
      // Exclude files that shouldn't be in the report
      exclude: [
        "packages/**/*.test.js",
        "packages/**/test/**",
        "packages/**/node_modules/**",
        "packages/examples/**",
        "packages/enocean-server/**",
        "packages/enocean2mqtt/**",
      ],
      // Reporters to use for coverage output
      reporter: ["text", "json", "html", "lcov"],
    },
  },
});
