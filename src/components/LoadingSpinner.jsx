import PropTypes from 'prop-types'

export const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div
    className="loading-root"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="loading-spinner" aria-hidden />
    <span>{label}</span>
  </div>
)

LoadingSpinner.propTypes = {
  label: PropTypes.string,
}

LoadingSpinner.defaultProps = {
  label: 'Loading…',
}
