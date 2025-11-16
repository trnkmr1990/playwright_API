// src/api/logger.js
function logRequest(method, url, status, durationMs) {
  const now = new Date().toISOString();
  console.log(
    `[${now}] [${method.toUpperCase()}] ${url} -> ${status} (${durationMs} ms)`
  );
}

module.exports = { logRequest };
