import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { childrenPropType } from "../types/componentTypes.js";
import { logger } from "../utils/logger.js";

const ErrorFallback = ({ error }) => (
  <div className="error-boundary-root" role="alert">
    <h1 className="error-boundary-title">Something went wrong</h1>
    <p className="error-boundary-text">
      {error instanceof Error ? error.message : "Unexpected error."}
    </p>
  </div>
);

const handleError = (error, info) => {
  logger.error("Unhandled React error.", error, info);
};

export const ErrorBoundary = ({ children }) => (
  <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
    {children}
  </ReactErrorBoundary>
);

ErrorBoundary.propTypes = {
  children: childrenPropType,
};

ErrorBoundary.defaultProps = {
  children: null,
};
