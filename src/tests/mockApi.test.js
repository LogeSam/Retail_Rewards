import { describe, expect, it, jest } from '@jest/globals'
import { fetchTransactions } from '../services/mockApi.js'
import { EMPTY_MOCK_TRANSACTIONS } from '../constants/mockData.js'

describe('fetchTransactions', () => {
  it('returns shallow clones', async () => {
    const rows = await fetchTransactions({ delayMs: 0 })
    rows[0].purchaseAmount = -1
    const { MOCK_TRANSACTIONS } = await import('../constants/mockData.js')
    expect(MOCK_TRANSACTIONS[0].purchaseAmount).not.toBe(-1)
  })

  it('rejects when shouldFail is true', async () => {
    await expect(
      fetchTransactions({ shouldFail: true, delayMs: 0 }),
    ).rejects.toThrow('Unable to load transactions.')
  })

  it('accepts custom empty dataset', async () => {
    const rows = await fetchTransactions({
      delayMs: 0,
      data: EMPTY_MOCK_TRANSACTIONS,
    })
    expect(rows).toEqual([])
  })

  it('resolves only after the configured async delay', async () => {
    jest.useFakeTimers()
    const promise = fetchTransactions({
      delayMs: 100,
      data: EMPTY_MOCK_TRANSACTIONS,
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
