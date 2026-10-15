// src/lib/apiInspector.js

const MAX_REQUESTS = 200;

let requests = [];
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeToRequests = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getRequestsSnapshot = () => requests;

const SENSITIVE_KEY =
  /password|token|authorization|cookie|secret|api.?key|signature|credential|card.?number|cvv|cvc|razorpay_payment_id|razorpay_order_id/i;

export const sanitizeData = (value, depth = 0) => {
  if (value == null) return value;
  if (depth > 8) return "[Maximum depth reached]";

  if (typeof value === "string") {
    if (value.length > 10000) {
      return `${value.slice(0, 10000)}… [truncated]`;
    }

    // Avoid accidentally displaying bearer tokens embedded in strings.
    return value.replace(
      /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
      "Bearer [REDACTED]"
    );
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 100)
      .map((item) => sanitizeData(item, depth + 1));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key)
          ? "[REDACTED]"
          : sanitizeData(item, depth + 1),
      ])
    );
  }

  return value;
};

const sanitizeUrl = (url = "") => {
  try {
    const parsed = new URL(url, window.location.origin);

    for (const key of parsed.searchParams.keys()) {
      if (SENSITIVE_KEY.test(key)) {
        parsed.searchParams.set(key, "[REDACTED]");
      }
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return String(url).split("?")[0];
  }
};

const safeHeaders = (headers) => {
  if (!headers) return {};

  const plainHeaders =
    typeof headers.toJSON === "function" ? headers.toJSON() : headers;

  return Object.fromEntries(
    Object.entries(plainHeaders).map(([key, value]) => [
      key,
      SENSITIVE_KEY.test(key) ||
      /^(authorization|cookie|set-cookie)$/i.test(key)
        ? "[REDACTED]"
        : String(value),
    ])
  );
};

export const startRequest = (config) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const startedAt = performance.now();
  const startTime = new Date().toISOString();

  const baseURL = config.baseURL || "";
  const rawUrl = config.url || "";
  const fullUrl = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : `${baseURL.replace(/\/$/, "")}/${rawUrl.replace(/^\//, "")}`;

  const request = {
    id,
    method: (config.method || "GET").toUpperCase(),
    url: sanitizeUrl(fullUrl),
    status: "Pending",
    statusCode: null,
    duration: null,
    startTime,
    requestData: sanitizeData(config.params || {}),
    requestBody: sanitizeData(config.data),
    requestHeaders: safeHeaders(config.headers),
    responseHeaders: {},
    responseData: null,
    error: null,
  };

  requests = [request, ...requests].slice(0, MAX_REQUESTS);
  notify();

  return { id, startedAt };
};

export const finishRequest = (id, startedAt, response, error) => {
  const duration = Math.round(performance.now() - startedAt);

  requests = requests.map((request) => {
    if (request.id !== id) return request;

    if (response) {
      return {
        ...request,
        statusCode: response.status,
        status: response.status >= 200 && response.status < 400
          ? "Success"
          : "Error",
        duration,
        responseHeaders: safeHeaders(response.headers),
        responseData: sanitizeData(response.data),
      };
    }

    return {
      ...request,
      status: error?.response ? "Error" : "Network Error",
      statusCode: error?.response?.status ?? null,
      duration,
      responseHeaders: safeHeaders(error?.response?.headers),
      responseData: sanitizeData(error?.response?.data),
      error: error?.response
        ? error.response.data?.message || error.message
        : error?.message || "Request failed",
    };
  });

  notify();
};

export const clearRequests = () => {
  requests = [];
  notify();
};