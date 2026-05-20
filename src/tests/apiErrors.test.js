import { describe, expect, it } from '@jest/globals'
import {
  ClientError,
  getUserMessage,
  isRetryableError,
  NetworkError,
  ServerError,
  TimeoutError,
} from '../services/apiErrors.js'

describe('apiErrors', () => {
  it('maps network errors to a connection message', () => {
    expect(getUserMessage(new NetworkError())).toMatch(/connect/i)
    expect(isRetryableError(new NetworkError())).toBe(true)
  })

  it('maps timeout errors to a timeout message', () => {
    expect(getUserMessage(new TimeoutError())).toMatch(/too long/i)
    expect(isRetryableError(new TimeoutError())).toBe(true)
  })

  it('maps client errors without retry', () => {
    const error = new ClientError(404)
    expect(getUserMessage(error)).toMatch(/not found/i)
    expect(isRetryableError(error)).toBe(false)
  })

  it('maps server errors with retry', () => {
    const error = new ServerError(503)
    expect(getUserMessage(error)).toMatch(/unavailable/i)
    expect(isRetryableError(error)).toBe(true)
  })

  it('falls back for unknown errors', () => {
    expect(getUserMessage(new Error('boom'))).toBe('boom')
    expect(isRetryableError(new Error('boom'))).toBe(false)
  })
})
