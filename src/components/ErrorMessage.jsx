import PropTypes from 'prop-types'

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-root" role="alert">
    <p className="error-text">{message}</p>
    {onRetry ? (
      <button type="button" className="btn-retry" onClick={onRetry}>
        Try again
      </button>
    ) : null}
  </div>
)

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
}

ErrorMessage.defaultProps = {
  onRetry: null,
}
