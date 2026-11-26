import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 4321;

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: `http://${host}:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm preview --host ${host} --port ${port} --ignore-lock`,
    env: { MEETUP_DESACTIVADO: "1" },
    port,
  },
});
