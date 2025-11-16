// src/api/schemaValidator.js
const Ajv = require("ajv");
const { expect } = require("@playwright/test");

const ajv = new Ajv({ allErrors: true });

function validateSchema(schema, data, schemaName = "response") {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    console.error(
      `Schema validation failed for ${schemaName}`,
      validate.errors
    );
  }

  expect(valid, `Schema validation failed for ${schemaName}`).toBe(true);
}

module.exports = { validateSchema };
