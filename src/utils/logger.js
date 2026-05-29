const noop = () => {}

const createLogger = () => {
  if (typeof console === 'undefined') {
    return {
      debug: noop,
      error: noop,
      info: noop,
      warn: noop,
    }
  }

  return {
    debug: (...args) => console.debug(...args),
    error: (...args) => console.error(...args),
    info: (...args) => console.info(...args),
    warn: (...args) => console.warn(...args),
  }
}

export const logger = createLogger()
