import PropTypes from 'prop-types'

export const EmptyState = ({
  title = 'No data',
  description,
}) => (
  <div className="empty-root">
    <p className="empty-title">{title}</p>
    {description ? <p className="empty-desc">{description}</p> : null}
  </div>
)

EmptyState.propTypes = {
  description: PropTypes.string,
  title: PropTypes.string,
}

EmptyState.defaultProps = {
  description: '',
  title: 'No data',
}
