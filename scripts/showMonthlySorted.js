import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { aggregateMonthlyRewards } from '../src/utils/aggregateRewards.js'
import { withMonthlyRowKeys } from '../src/utils/rewardRows.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const transactionsPath = join(__dirname, '../public/mock/transactions.json')
const transactions = JSON.parse(readFileSync(transactionsPath, 'utf8'))

const monthly = aggregateMonthlyRewards(transactions)
const rows = withMonthlyRowKeys(monthly)

console.log(
  rows
    .map(
      (row) =>
        `${row.customerId} | ${row.customerName} | ${row.month} | ${row.year} | ${row.rewardPoints}`,
    )
    .join('\n'),
)
