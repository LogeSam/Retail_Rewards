import { describe, expect, it } from '@jest/globals'
import {
  aggregateMonthlyRewards,
  aggregateTotalRewardsByCustomer,
  compareMonthlyRewards,
  enrichTransactionsWithRewards,
} from '../utils/aggregateRewards.js'

const baseTx = (overrides) => ({
  transactionId: 't1',
  customerId: 'c1',
  customerName: 'Alice',
  purchaseDate: '2024-01-15T15:00:00.000Z',
  productPurchased: 'Widget',
  purchaseAmount: 120,
  ...overrides,
})

describe('enrichTransactionsWithRewards', () => {
  it('adds rewardPoints per rules', () => {
    const out = enrichTransactionsWithRewards([baseTx({ purchaseAmount: 120 })])
    expect(out[0].rewardPoints).toBe(90)
  })
})

describe('aggregateMonthlyRewards', () => {
  it('sums by customer month year and sorts by year month customer', () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        transactionId: 'a',
        customerId: 'c2',
        customerName: 'Bob',
        purchaseDate: '2023-12-15T15:00:00.000Z',
        purchaseAmount: 60,
      }),
      baseTx({
        transactionId: 'b',
        customerId: 'c1',
        customerName: 'Alice',
        purchaseDate: '2024-01-10T15:00:00.000Z',
        purchaseAmount: 120,
      }),
      baseTx({
        transactionId: 'c',
        customerId: 'c1',
        customerName: 'Alice',
        purchaseDate: '2024-01-20T15:00:00.000Z',
        purchaseAmount: 50,
      }),
    ])
    const monthly = aggregateMonthlyRewards(txs)
    expect(monthly.length).toBe(2)
    expect(monthly[0].year).toBe(2023)
    expect(monthly[0].month).toBe('December')
    expect(monthly[0].rewardPoints).toBe(10)
    expect(monthly[1].year).toBe(2024)
    expect(monthly[1].month).toBe('January')
    expect(monthly[1].rewardPoints).toBe(90)
  })

  it('ignores invalid dates', () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({ purchaseDate: 'not-a-date', purchaseAmount: 120 }),
    ])
    expect(aggregateMonthlyRewards(txs)).toEqual([])
  })

  it('keeps same month in different years as separate summaries', () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        transactionId: 'jan-2024',
        purchaseDate: '2024-01-15T15:00:00.000Z',
        purchaseAmount: 120,
      }),
      baseTx({
        transactionId: 'jan-2025',
        purchaseDate: '2025-01-15T15:00:00.000Z',
        purchaseAmount: 100,
      }),
    ])

    expect(aggregateMonthlyRewards(txs)).toEqual([
      {
        customerId: 'c1',
        customerName: 'Alice',
        month: 'January',
        rewardPoints: 90,
        year: 2024,
      },
      {
        customerId: 'c1',
        customerName: 'Alice',
        month: 'January',
        rewardPoints: 50,
        year: 2025,
      },
    ])
  })

  it('sorts monthly summaries by year, month, and customer', () => {
    const sorted = [
      {
        customerId: 'c2',
        month: 'March',
        year: 2025,
      },
      {
        customerId: 'c1',
        month: 'January',
        year: 2024,
      },
      {
        customerId: 'c2',
        month: 'January',
        year: 2024,
      },
    ].sort(compareMonthlyRewards)

    expect(sorted.map((row) => `${row.year}-${row.month}-${row.customerId}`))
      .toEqual([
        '2024-January-c1',
        '2024-January-c2',
        '2025-March-c2',
      ])
  })
})

describe('aggregateTotalRewardsByCustomer', () => {
  it('sums totals and sorts by name', () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        customerId: 'c2',
        customerName: 'Zed',
        purchaseAmount: 100,
      }),
      baseTx({
        transactionId: 't2',
        customerId: 'c1',
        customerName: 'Alice',
        purchaseAmount: 100,
      }),
    ])
    const totals = aggregateTotalRewardsByCustomer(txs)
    expect(totals).toEqual([
      { customerName: 'Alice', totalRewardPoints: 50 },
      { customerName: 'Zed', totalRewardPoints: 50 },
    ])
  })
})
