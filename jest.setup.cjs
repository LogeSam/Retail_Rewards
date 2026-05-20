process.env.TZ = 'UTC'

require('@testing-library/jest-dom')

if (!globalThis.fetch) {
  globalThis.fetch = () =>
    Promise.reject(new TypeError('fetch is not available in this test environment'))
}

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.window.matchMedia) {
  globalThis.window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })
}
