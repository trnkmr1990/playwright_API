// src/api/schemas.js
const productsListSchema = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
        required: ["id", "name"],
        additionalProperties: true,
      },
    },
  },
  required: ["products"],
  additionalProperties: true,
};

module.exports = { productsListSchema };
