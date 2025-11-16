const endpoints = require("../../config/endpoints.json");
//const { request } = require("@playwright/test");
const { logRequest } = require("./logger");

class ApiClient {
  constructor(request, baseUrl) {
    this.request = request;
    this.baseUrl = baseUrl ?? endpoints.baseUrl;
  }

  url(path) {
    if (typeof path !== "string") throw new Error("path must be a string");
    if (path.startsWith("http")) return path;
    const base = this.baseUrl.replace(/\/+$/g, "");
    const p = path.replace(/^\/+/g, "");
    return `${base}/${p}`;
  }

  async get(path, options) {
    const url = this.url(path);
    const start = Date.now();
    const res = await this.request.get(url, options);
    logRequest("get", url, res.status(), Date.now() - start);
    return res;
  }

  async post(path, data, options) {
    const requestOptions = Object.assign({}, options, { data });
    return this.request.post(this.url(path), requestOptions);
  }

  async put(path, data, options) {
    const requestOptions = Object.assign({}, options, { data });
    return this.request.put(this.url(path), requestOptions);
  }

  async delete(path, dataOrOptions) {
    let options;
    if (!dataOrOptions) {
      options = undefined;
    } else if (
      dataOrOptions &&
      (dataOrOptions.headers || dataOrOptions.params || dataOrOptions.data)
    ) {
      options = dataOrOptions;
    } else {
      options = { data: dataOrOptions };
    }
    return this.request.delete(this.url(path), options);
  }

  /**
   * Lightweight JSON-schema-like validator.
   * Supports `type`, `required`, `properties`, and `items` for arrays.
   * Example schema:
   * { type: 'object', required: ['id'], properties: { id: { type: 'number' }, name: { type: 'string' } } }
   */
  _validateJson(value, schema, path = "") {
    const errors = [];
    const add = (msg) => errors.push(path ? `${path}: ${msg}` : msg);

    if (!schema) return { ok: true, errors: [] };

    if (schema.type) {
      const t = Array.isArray(value)
        ? "array"
        : value === null
        ? "null"
        : typeof value;
      if (schema.type !== t) {
        add(`expected type ${schema.type} but got ${t}`);
        return { ok: false, errors };
      }
    }

    if (schema.type === "object") {
      if (schema.required && Array.isArray(schema.required)) {
        for (const key of schema.required) {
          if (!Object.prototype.hasOwnProperty.call(value || {}, key)) {
            add(`missing required property '${key}'`);
          }
        }
      }
      if (schema.properties && typeof schema.properties === "object") {
        for (const [key, subschema] of Object.entries(schema.properties)) {
          if (Object.prototype.hasOwnProperty.call(value || {}, key)) {
            const res = this._validateJson(
              value[key],
              subschema,
              path ? `${path}.${key}` : key
            );
            if (!res.ok) errors.push(...res.errors);
          }
        }
      }
    }

    if (schema.type === "array") {
      if (!Array.isArray(value)) {
        add(`expected array but got ${typeof value}`);
        return { ok: false, errors };
      }
      if (schema.items) {
        for (let i = 0; i < value.length; i++) {
          const res = this._validateJson(
            value[i],
            schema.items,
            `${path}[${i}]`
          );
          if (!res.ok) errors.push(...res.errors);
        }
      }
    }

    return { ok: errors.length === 0, errors };
  }

  /**
   * Validate status, headers (contains), and optional json schema.
   * options: { status: number|array, headersContains: { name: string }, jsonSchema }
   * Returns { ok: boolean, errors: string[] }
   */
  async validateResponse(response, options = {}) {
    const errors = [];
    const expectedStatus = options.status ?? 200;
    const actualStatus = response.status();
    if (Array.isArray(expectedStatus)) {
      if (!expectedStatus.includes(actualStatus))
        errors.push(
          `status ${actualStatus} not in ${JSON.stringify(expectedStatus)}`
        );
    } else if (typeof expectedStatus === "number") {
      if (actualStatus !== expectedStatus)
        errors.push(`status ${actualStatus} !== expected ${expectedStatus}`);
    }

    if (
      options.headersContains &&
      typeof options.headersContains === "object"
    ) {
      const hdrs = response.headers();
      for (const [k, v] of Object.entries(options.headersContains)) {
        const actual = hdrs[k.toLowerCase()] || hdrs[k];
        if (!actual) {
          errors.push(`missing header '${k}'`);
        } else {
          if (v instanceof RegExp) {
            if (!v.test(actual))
              errors.push(
                `header '${k}' value '${actual}' does not match ${v}`
              );
          } else if (typeof v === "string") {
            if (!actual.includes(v))
              errors.push(
                `header '${k}' value '${actual}' does not contain '${v}'`
              );
          }
        }
      }
    }

    if (options.jsonSchema) {
      let body;
      try {
        body = await response.json();
      } catch (e) {
        errors.push("response body is not valid JSON");
      }
      if (body !== undefined) {
        const res = this._validateJson(body, options.jsonSchema);
        if (!res.ok) errors.push(...res.errors.map((e) => `json: ${e}`));
      }
    }

    return { ok: errors.length === 0, errors };
  }

  /**
   * Assert the response is valid according to options, throws with details when invalid.
   */
  async assertValidResponse(response, options = {}) {
    const res = await this.validateResponse(response, options);
    if (!res.ok) {
      const msg = `Response validation failed: ${res.errors.join("; ")}`;
      const e = new Error(msg);
      e.details = res.errors;
      throw e;
    }
    return true;
  }

  productsList() {
    return this.get(endpoints.productsList);
  }

  searchProduct(payload) {
    return this.post(endpoints.searchProduct, payload);
  }

  brandsList() {
    return this.get(endpoints.brandsList);
  }

  login(payload) {
    return this.post(endpoints.login, payload);
  }

  // login_new(payload) {
  //   const response = this.request.post(this.url(endpoints.login), payload);
  //   return response;
  // }

  // async login_Context(payload) {
  //   const context = await request.newContext();
  //   const response = await context.post(this.url(endpoints.login), payload);
  //   return response;
  // }

  createUser(payload) {
    return this.post(endpoints.createUser, payload);
  }

  deleteUser(payload) {
    return this.delete(endpoints.deleteUser, payload);
  }
}

module.exports = { ApiClient };
