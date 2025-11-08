import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Use environment variable for baseUrl, fallback to localhost for development
    baseUrl: process.env.CYPRESS_baseUrl || "http://localhost:5173",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    testIsolation: false,
    experimentalWebKitSupport: true,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
});
