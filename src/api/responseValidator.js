const { expect } = require("@playwright/test");

async function validateJsonResponse(response, { status = 200 } = {}) {
  expect(response.status(), "Unexpected HTTP status").toBe(status);
  expect(response.ok(), "Response.ok() should be true").toBeTruthy();
  const body = await response.json().catch(() => null);
  expect(body, "Response body should be valid JSON").toBeTruthy();
  return body;
}

module.exports = { validateJsonResponse };
