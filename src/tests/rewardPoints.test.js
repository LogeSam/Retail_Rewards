import { describe, expect, it } from '@jest/globals'
import { calculateRewardPoints } from '../utils/rewardPoints.js'

describe('calculateRewardPoints', () => {
  it('returns 90 for $120', () => {
    expect(calculateRewardPoints(120)).toBe(90)
  })

  it('returns 0 below $50', () => {
    expect(calculateRewardPoints(49)).toBe(0)
    expect(calculateRewardPoints(49.99)).toBe(0)
    expect(calculateRewardPoints(0)).toBe(0)
  })

  it('returns 0 at exactly $50', () => {
    expect(calculateRewardPoints(50)).toBe(0)
  })

  it('returns 1 at $51', () => {
    expect(calculateRewardPoints(51)).toBe(1)
  })

  it('returns 50 at exactly $100', () => {
    expect(calculateRewardPoints(100)).toBe(50)
  })

  it('floors decimals so $100.2 and $100.4 earn 50', () => {
    expect(calculateRewardPoints(100.2)).toBe(50)
    expect(calculateRewardPoints(100.4)).toBe(50)
    expect(calculateRewardPoints(120.99)).toBe(90)
  })

  it('handles larger purchases', () => {
    expect(calculateRewardPoints(200)).toBe(50 + 100 * 2)
  })

  it('returns 0 for non-numeric or negative', () => {
    expect(calculateRewardPoints(Number.NaN)).toBe(0)
    expect(calculateRewardPoints('x')).toBe(0)
    expect(calculateRewardPoints(-10)).toBe(0)
  })
})
