import { useCallback, useEffect, useMemo, useReducer } from "react";
import { getUserMessage, isRetryableError } from "../services/apiErrors.js";
import { fetchTransactions } from "../services/mockApi.js";
import {
  aggregateMonthlyRewards,
  aggregateTotalRewardsByCustomer,
  enrichTransactionsWithRewards,
} from "../utils/aggregateRewards.js";
import { logger } from "../utils/logger.js";

const initialRewardsState = {
  error: null,
  retryable: true,
  rawTransactions: [],
  status: "loading",
};

const rewardsDataReducer = (state, action) => {
  if (action.type === "loading") {
    return {
      ...state,
      error: null,
      retryable: true,
      status: "loading",
    };
  }

  if (action.type === "success") {
    return {
      error: null,
      retryable: true,
      rawTransactions: action.payload,
      status: "success",
    };
  }

  if (action.type === "error") {
    return {
      error: action.payload.message,
      retryable: action.payload.retryable,
      rawTransactions: [],
      status: "error",
    };
  }

  return state;
};

const resolveErrorState = (error) => ({
  message: getUserMessage(error),
  retryable: isRetryableError(error),
});

const loadTransactions = (fetchOptions, override = {}) =>
  fetchTransactions({
    ...(fetchOptions ?? {}),
    ...override,
  });

export const useRewardsData = (fetchOptions) => {
  // useReducer dispatch — not Redux useDispatch.
  const [state, dispatch] = useReducer(rewardsDataReducer, initialRewardsState);

  const executeLoad = useCallback(
    async (override = {}, isActive = () => true) => {
      dispatch({ type: "loading" });

      try {
        const data = await loadTransactions(fetchOptions, override);
        if (isActive()) {
          dispatch({ type: "success", payload: data });
        }
      } catch (error) {
        logger.error("Unable to load reward transactions.", error);
        if (isActive()) {
          dispatch({ type: "error", payload: resolveErrorState(error) });
        }
      }
    },
    [fetchOptions],
  );

  const load = useCallback(
    (override = {}) => {
      void executeLoad(override);
    },
    [executeLoad],
  );

  useEffect(() => {
    let active = true;

    void executeLoad(undefined, () => active);

    return () => {
      active = false;
    };
  }, [executeLoad]);

  const transactions = useMemo(() => {
    try {
      return enrichTransactionsWithRewards(state.rawTransactions);
    } catch (error) {
      logger.error("Unable to enrich transactions.", error);
      return [];
    }
  }, [state.rawTransactions]);

  const monthlyRewards = useMemo(() => {
    try {
      return aggregateMonthlyRewards(transactions);
    } catch (error) {
      logger.error("Unable to aggregate monthly rewards.", error);
      return [];
    }
  }, [transactions]);

  const totals = useMemo(() => {
    try {
      return aggregateTotalRewardsByCustomer(transactions);
    } catch (error) {
      logger.error("Unable to aggregate total rewards.", error);
      return [];
    }
  }, [transactions]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  return {
    transactions,
    monthlyRewards,
    totals,
    loading: state.status === "loading",
    error: state.error,
    retryable: state.retryable,
    retry,
  };
};
