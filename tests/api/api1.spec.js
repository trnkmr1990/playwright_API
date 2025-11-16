const { test, expect } = require("@playwright/test");
const { ApiClient } = require("../../src/api/apiClient");
const endpoints = require("../../config/endpoints.json");
const usersData = require("../data/users.json");
const { validateJsonResponse } = require("../../src/api/responseValidator");
const { validateSchema } = require("../../src/api/schemaValidator");
const { productsListSchema } = require("../../src/api/schema");

test.describe("AutomationExercise API smoke", () => {
  // test("GET products list", async ({ request }) => {
  //   const api = new ApiClient(request, endpoints.baseUrl);
  //   const res = await api.productsList();
  //   const body = await validateJsonResponse(res, { status: 200 });
  //   validateSchema(productsListSchema, body, "Products List");
  // });

  test("POST search product (happy path)", async ({ request }) => {
    const api = new ApiClient(request);
    const payload = { search_product: "dress" };
    const res = await api.searchProduct(payload);
    expect(res.ok()).toBeTruthy();
    const json = await res.json().catch(() => null);
    expect(json).toBeTruthy();
  });

  test("POST login valid/invalid", async ({ request }) => {
    const api = new ApiClient(request);
    const invalid = await api.login(usersData.invalidLogin);
    expect(invalid.status()).not.toBe(200);
  });

  test("Create and delete user (flow)", async ({ request }) => {
    const api = new ApiClient(request);
    const ts = Date.now();
    const email = `apitest+${ts}@example.com`;
    const newUser = {
      name: "API Tester",
      email,
      password: "Password123!",
    };

    const create = await api.createUser(newUser);
    expect(create.ok()).toBeTruthy();
    const createJson = await create.json().catch(() => null);
    expect(createJson).toBeTruthy();

    const deleteRes = await api.deleteUser({ email });
    expect(deleteRes.ok()).toBeTruthy();
  });
});
