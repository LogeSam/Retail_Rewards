import PropTypes from "prop-types";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { childrenPropType } from "../types/componentTypes.js";
import { logger } from "../utils/logger.js";

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-boundary-root" role="alert">
    <h1 className="error-boundary-title">Something went wrong</h1>
    <p className="error-boundary-text">
      {error instanceof Error ? error.message : "Unexpected error."}
    </p>
    <button
      type="button"
      className="btn-retry error-boundary-retry"
      onClick={resetErrorBoundary}
    >
      Try again
    </button>
  </div>
);

ErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

const handleError = (error, info) => {
  logger.error("Unhandled React error.", error, info);
};

const handleReset = () => {
  logger.info("React error boundary reset.");
};

export const ErrorBoundary = ({ children = null, resetKeys = [] }) => (
  <ReactErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={handleError}
    onReset={handleReset}
    resetKeys={resetKeys}
  >
    {children}
  </ReactErrorBoundary>
);

ErrorBoundary.propTypes = {
  children: childrenPropType,
  resetKeys: PropTypes.arrayOf(PropTypes.any),
};
