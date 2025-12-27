import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost.bulin.com:8080/',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Unit Test',
      testDir: 'tests/unit',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
})
