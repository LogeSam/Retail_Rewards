import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aggregateMonthlyRewards,
  enrichTransactionsWithRewards,
} from '../src/utils/aggregateRewards.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const transactionsPath = join(__dirname, '../public/mock/transactions.json')
const transactions = JSON.parse(readFileSync(transactionsPath, 'utf8'))

const rows = aggregateMonthlyRewards(enrichTransactionsWithRewards(transactions))

console.log(
  rows
    .map(
      (row) =>
        `${row.customerId} | ${row.customerName} | ${row.month} | ${row.year} | ${row.rewardPoints}`,
    )
    .join('\n'),
)
