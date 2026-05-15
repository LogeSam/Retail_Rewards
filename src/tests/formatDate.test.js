import { describe, expect, it } from '@jest/globals'
import { formatCurrency } from '../utils/formatCurrency.js'
import { formatPurchaseDate } from '../utils/formatDate.js'

describe('formatPurchaseDate', () => {
  it('returns empty string for invalid input', () => {
    expect(formatPurchaseDate('invalid', 'en-US')).toBe('')
  })

  it('formats valid ISO string', () => {
    const s = formatPurchaseDate('2024-06-01T00:00:00.000Z', 'en-US')
    expect(s).toBe('Jun 1, 2024')
  })

  it('respects the provided locale', () => {
    const s = formatPurchaseDate('2024-06-01T00:00:00.000Z', 'en-GB')
    expect(s).toBe('1 Jun 2024')
  })
})

describe('formatCurrency', () => {
  it('formats USD amounts with decimal precision', () => {
    expect(formatCurrency(19.99, 'en-US')).toBe('$19.99')
  })
})
