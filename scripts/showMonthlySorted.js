import { aggregateMonthlyRewards } from '../src/utils/aggregateRewards.js'
import { MOCK_TRANSACTIONS } from '../src/constants/mockData.js'
import { withMonthlyRowKeys } from '../src/utils/rewardRows.js'

const monthly = aggregateMonthlyRewards(MOCK_TRANSACTIONS)

const extractNum = (id) => {
  const m = String(id).match(/(\d+)$/)
  return m ? Number(m[1]) : NaN
}

const sorted = [...monthly].sort((a, b) => {
  const aNum = extractNum(a.customerId)
  const bNum = extractNum(b.customerId)
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
    return aNum - bNum
  }

  const idCompare = String(a.customerId).localeCompare(String(b.customerId))
  if (idCompare !== 0) return idCompare

  if (a.year !== b.year) return a.year - b.year

  const aMonth = new Date(`${a.month} 1, ${a.year}`).getMonth()
  const bMonth = new Date(`${b.month} 1, ${b.year}`).getMonth()
  return aMonth - bMonth
})

const rows = withMonthlyRowKeys(sorted)

console.log(rows.map(r => `${r.customerId} | ${r.customerName} | ${r.month} | ${r.year} | ${r.rewardPoints}`).join('\n'))
