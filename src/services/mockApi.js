import {
  ClientError,
  NetworkError,
  ServerError,
  TimeoutError,
} from "./apiErrors.js";

export const DEFAULT_TRANSACTIONS_URL = "/mock/transactions.json";
export const EMPTY_TRANSACTIONS_URL = "/mock/transactions-empty.json";

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * fetchTransactions simulates a remote API. `options.shouldFail` may be:
 * - false (default)
 * - true (alias for 'network')
 * - 'network' | 'timeout' | 'client' | 'server'
 */
export const fetchTransactions = async (options = {}) => {
  const {
    shouldFail = false,
    delayMs = 500,
    url = DEFAULT_TRANSACTIONS_URL,
    clientStatus = 400,
    serverStatus = 500,
    timeoutMs = 10000,
  } = options;

  await delay(delayMs);

  const failMode = shouldFail === true ? "network" : shouldFail;

  if (failMode === "timeout") {
    throw new TimeoutError();
  }

  if (failMode === "client") {
    throw new ClientError(clientStatus);
  }

  if (failMode === "server") {
    throw new ServerError(serverStatus);
  }

  let response;

  try {
    if (failMode === "network") {
      throw new TypeError("Failed to fetch");
    }

    response = await fetchWithTimeout(url, timeoutMs);
  } catch (error) {
    if (failMode === "network" || error.name === "TypeError") {
      throw new NetworkError();
    }
    if (error.name === "AbortError") {
      throw new TimeoutError();
    }

    throw error;
  }

  if (!response.ok) {
    const status = response.status;
    if (status >= 500) {
      throw new ServerError(status);
    }
    throw new ClientError(status);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid transactions payload.");
  }

  return data.map((row) => ({ ...row }));
};
