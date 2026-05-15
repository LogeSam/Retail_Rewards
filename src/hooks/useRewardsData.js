import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { fetchTransactions } from '../services/mockApi.js'
import {
  aggregateMonthlyRewards,
  aggregateTotalRewardsByCustomer,
  enrichTransactionsWithRewards,
} from '../utils/aggregateRewards.js'
import { logger } from '../utils/logger.js'

const initialRewardsState = {
  error: null,
  rawTransactions: [],
  status: 'loading',
}

const rewardsDataReducer = (state, action) => {
  if (action.type === 'loading') {
    return {
      ...state,
      error: null,
      status: 'loading',
    }
  }

  if (action.type === 'success') {
    return {
      error: null,
      rawTransactions: action.payload,
      status: 'success',
    }
  }

  if (action.type === 'error') {
    return {
      error: action.payload,
      rawTransactions: [],
      status: 'error',
    }
  }

  return state
}

const resolveErrorMessage = (error) =>
  error instanceof Error ? error.message : 'Something went wrong.'

const loadTransactions = (fetchOptions, override = {}) =>
  fetchTransactions({
    ...(fetchOptions ?? {}),
    ...override,
  })

export const useRewardsData = (fetchOptions) => {
  const [state, dispatch] = useReducer(
    rewardsDataReducer,
    initialRewardsState,
  )

  const load = useCallback(
    async (override = {}) => {
      dispatch({ type: 'loading' })
      try {
        const data = await loadTransactions(fetchOptions, override)
        dispatch({ type: 'success', payload: data })
      } catch (error) {
        logger.error('Unable to load reward transactions.', error)
        dispatch({ type: 'error', payload: resolveErrorMessage(error) })
      }
    },
    [fetchOptions],
  )

  useEffect(() => {
    let active = true

    const loadInitialData = async () => {
      try {
        const data = await loadTransactions(fetchOptions)
        if (active) {
          dispatch({ type: 'success', payload: data })
        }
      } catch (error) {
        logger.error('Unable to load reward transactions.', error)
        if (active) {
          dispatch({ type: 'error', payload: resolveErrorMessage(error) })
        }
      }
    }

    void loadInitialData()

    return () => {
      active = false
    }
  }, [fetchOptions])

  const transactions = useMemo(
    () => enrichTransactionsWithRewards(state.rawTransactions),
    [state.rawTransactions],
  )

  const monthlyRewards = useMemo(
    () => aggregateMonthlyRewards(transactions),
    [transactions],
  )

  const totals = useMemo(
    () => aggregateTotalRewardsByCustomer(transactions),
    [transactions],
  )

  const retry = useCallback(() => {
    void load({ shouldFail: false })
  }, [load])

  return {
    transactions,
    monthlyRewards,
    totals,
    loading: state.status === 'loading',
    error: state.error,
    retry,
  }
}
