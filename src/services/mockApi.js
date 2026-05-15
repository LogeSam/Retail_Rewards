import { MOCK_TRANSACTIONS } from '../constants/mockData.js'

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const fetchTransactions = async (options = {}) => {
  const {
    shouldFail = false,
    delayMs = 500,
    data = MOCK_TRANSACTIONS,
  } = options
  await delay(delayMs)
  if (shouldFail) {
    throw new Error('Unable to load transactions.')
  }
  return data.map((row) => ({ ...row }))
}
