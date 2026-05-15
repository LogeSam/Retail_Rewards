const noop = () => {}

const createLogger = () => {
  if (typeof console === 'undefined') {
    return {
      error: noop,
      warn: noop,
    }
  }

  return {
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
  }
}

export const logger = createLogger()
