import {
  ClientError,
  NetworkError,
  ServerError,
  TimeoutError,
} from "./apiErrors.js";
import { logger } from "../utils/logger.js";

export const DEFAULT_TRANSACTIONS_URL = "/mock/transactions.json";
export const EMPTY_TRANSACTIONS_URL = "/mock/transactions-empty.json";

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getErrorName = (error) =>
  error && typeof error === "object" && "name" in error ? error.name : "";

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (getErrorName(error) === "AbortError") {
      logger.warn("Transaction fetch timed out.", { timeoutMs, url });
      throw new TimeoutError();
    }

    if (error instanceof TypeError) {
      logger.warn("Transaction fetch failed with a network error.", { url });
      throw new NetworkError();
    }

    logger.error("Unexpected error while fetching transactions.", error);
    throw error;
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
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      throw error;
    }

    if (error instanceof TypeError) {
      logger.warn("Transaction fetch failed with a network error.", { url });
      throw new NetworkError();
    }

    logger.error("Unexpected transaction fetch failure.", error);
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
