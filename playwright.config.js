/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
};

module.exports = config;
