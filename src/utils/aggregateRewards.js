import { calculateRewardPoints } from './rewardPoints.js'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const enrichTransactionsWithRewards = (transactions) =>
  transactions.map((tx) => ({
    ...tx,
    rewardPoints: calculateRewardPoints(tx.purchaseAmount),
  }))

const parsePurchaseDate = (purchaseDate) => new Date(purchaseDate)

const getPurchaseDateParts = (purchaseDate) => {
  const date = parsePurchaseDate(purchaseDate)
  if (Number.isNaN(date.getTime())) return null

  return {
    monthIndex: date.getMonth(),
    year: date.getFullYear(),
  }
}

const monthlyKey = (customerId, year, monthIndex) =>
  `${customerId}|${year}|${monthIndex}`

const getMonthIndexByName = (monthName) => MONTH_NAMES.indexOf(monthName)

export const compareMonthlyRewards = (a, b) => {
  if (a.year !== b.year) return a.year - b.year

  const monthDelta =
    getMonthIndexByName(a.month) - getMonthIndexByName(b.month)
  if (monthDelta !== 0) return monthDelta

  return String(a.customerId).localeCompare(String(b.customerId))
}

export const aggregateMonthlyRewards = (transactions) => {
  const byKey = transactions.reduce((acc, tx) => {
    const dateParts = getPurchaseDateParts(tx.purchaseDate)
    if (!dateParts) return acc

    const { monthIndex, year } = dateParts
    const key = monthlyKey(tx.customerId, year, monthIndex)
    const prev = acc[key]
    const add = tx.rewardPoints ?? 0
    if (!prev) {
      acc[key] = {
        customerId: tx.customerId,
        customerName: tx.customerName,
        month: MONTH_NAMES[monthIndex],
        year,
        rewardPoints: add,
      }
    } else {
      acc[key] = {
        ...prev,
        rewardPoints: prev.rewardPoints + add,
      }
    }
    return acc
  }, {})

  return Object.values(byKey).sort(compareMonthlyRewards)
}

export const aggregateTotalRewardsByCustomer = (transactions) => {
  const byCustomer = transactions.reduce((acc, tx) => {
    const id = tx.customerId
    const prev = acc[id]
    const add = tx.rewardPoints ?? 0
    if (!prev) {
      acc[id] = {
        customerName: tx.customerName,
        totalRewardPoints: add,
      }
    } else {
      acc[id] = {
        ...prev,
        totalRewardPoints: prev.totalRewardPoints + add,
      }
    }
    return acc
  }, {})

  return Object.values(byCustomer).sort((a, b) =>
    a.customerName.localeCompare(b.customerName),
  )
}
