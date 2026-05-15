import { Component } from 'react'
import { childrenPropType } from '../types/componentTypes.js'
import { logger } from '../utils/logger.js'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected error.',
    }
  }

  componentDidCatch(error, info) {
    logger.error('Unhandled React error.', error, info)
  }

  render() {
    const { hasError, message } = this.state
    const { children } = this.props

    if (hasError) {
      return (
        <div className="error-boundary-root" role="alert">
          <h1 className="error-boundary-title">Something went wrong</h1>
          <p className="error-boundary-text">{message}</p>
        </div>
      )
    }

    return children
  }
}

ErrorBoundary.propTypes = {
  children: childrenPropType,
}

ErrorBoundary.defaultProps = {
  children: null,
}
