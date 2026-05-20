import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals'
import {
  ClientError,
  NetworkError,
  ServerError,
  TimeoutError,
} from '../services/apiErrors.js'
import {
  EMPTY_TRANSACTIONS_URL,
  fetchTransactions,
} from '../services/mockApi.js'

const sampleTransactions = [
  {
    transactionId: 'tx-0001',
    customerId: 'cust-1',
    customerName: 'Test User',
    purchaseDate: '2024-01-15T15:00:00.000Z',
    productPurchased: 'Widget',
    purchaseAmount: 120,
  },
]

const mockFetchJson = (data, { ok = true, status = 200 } = {}) => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => data,
  })
}

describe('fetchTransactions', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleTransactions,
    })
  })

  afterEach(() => {
    globalThis.fetch = undefined
  })

  it('returns shallow clones', async () => {
    const rows = await fetchTransactions({ delayMs: 0 })
    rows[0].purchaseAmount = -1
    expect(sampleTransactions[0].purchaseAmount).toBe(120)
  })

  it('fetches from the default transactions URL', async () => {
    await fetchTransactions({ delayMs: 0 })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/mock/transactions.json',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('rejects with a network error when shouldFail is true', async () => {
    await expect(
      fetchTransactions({ shouldFail: true, delayMs: 0 }),
    ).rejects.toBeInstanceOf(NetworkError)
  })

  it('rejects with a timeout error when shouldFail is timeout', async () => {
    await expect(
      fetchTransactions({ shouldFail: 'timeout', delayMs: 0 }),
    ).rejects.toBeInstanceOf(TimeoutError)
  })

  it('rejects with a client error when shouldFail is client', async () => {
    await expect(
      fetchTransactions({ shouldFail: 'client', delayMs: 0, clientStatus: 404 }),
    ).rejects.toMatchObject({
      name: 'ClientError',
      status: 404,
      retryable: false,
    })
  })

  it('rejects with a server error when shouldFail is server', async () => {
    await expect(
      fetchTransactions({ shouldFail: 'server', delayMs: 0, serverStatus: 503 }),
    ).rejects.toBeInstanceOf(ServerError)
  })

  it('loads an empty dataset from the empty transactions URL', async () => {
    mockFetchJson([])
    const rows = await fetchTransactions({
      delayMs: 0,
      url: EMPTY_TRANSACTIONS_URL,
    })
    expect(rows).toEqual([])
    expect(globalThis.fetch).toHaveBeenCalledWith(
      EMPTY_TRANSACTIONS_URL,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('rejects when the response is not ok', async () => {
    mockFetchJson([], { ok: false, status: 500 })
    await expect(fetchTransactions({ delayMs: 0 })).rejects.toBeInstanceOf(
      ServerError,
    )
  })

  it('rejects with a client error when the response is 404', async () => {
    mockFetchJson([], { ok: false, status: 404 })
    await expect(fetchTransactions({ delayMs: 0 })).rejects.toBeInstanceOf(
      ClientError,
    )
  })

  it('resolves only after the configured async delay', async () => {
    jest.useFakeTimers()
    mockFetchJson([])

    const promise = fetchTransactions({
      delayMs: 100,
      url: EMPTY_TRANSACTIONS_URL,
    })
    let resolved = false

    promise.then(() => {
      resolved = true
    })

    await Promise.resolve()
    expect(resolved).toBe(false)

    await jest.advanceTimersByTimeAsync(100)
    await expect(promise).resolves.toEqual([])
    expect(resolved).toBe(true)
    jest.useRealTimers()
  })
})
