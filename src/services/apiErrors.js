export const API_ERROR_CODES = {
  NETWORK: "network",
  TIMEOUT: "timeout",
  CLIENT: "client",
  SERVER: "server",
  UNKNOWN: "unknown",
};

export class ApiError extends Error {
  constructor(message, { code = API_ERROR_CODES.UNKNOWN, status, retryable } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.retryable = retryable ?? false;
  }
}

export class NetworkError extends ApiError {
  constructor(message = "Network connection failed.") {
    super(message, { code: API_ERROR_CODES.NETWORK, retryable: true });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiError {
  constructor(message = "The request timed out.") {
    super(message, { code: API_ERROR_CODES.TIMEOUT, retryable: true });
    this.name = "TimeoutError";
  }
}

export class ClientError extends ApiError {
  constructor(status, message) {
    super(message ?? clientMessageForStatus(status), {
      code: API_ERROR_CODES.CLIENT,
      status,
      retryable: false,
    });
    this.name = "ClientError";
  }
}

export class ServerError extends ApiError {
  constructor(status = 500, message) {
    super(message ?? "The server is temporarily unavailable.", {
      code: API_ERROR_CODES.SERVER,
      status,
      retryable: true,
    });
    this.name = "ServerError";
  }
}

const clientMessageForStatus = (status) => {
  if (status === 404) {
    return "The requested resource was not found.";
  }
  if (status === 400) {
    return "The request was invalid.";
  }
  return "The request could not be completed.";
};

export const getUserMessage = (error) => {
  if (error instanceof NetworkError) {
    return "Unable to connect. Check your network connection and try again.";
  }
  if (error instanceof TimeoutError) {
    return "The request took too long. Please try again.";
  }
  if (error instanceof ClientError) {
    return error.message;
  }
  if (error instanceof ServerError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};

export const isRetryableError = (error) => {
  if (error instanceof ApiError) {
    return error.retryable;
  }
  return false;
};
