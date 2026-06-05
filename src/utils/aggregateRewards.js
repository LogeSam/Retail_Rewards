import { calculateRewardPoints } from "./rewardPoints.js";
import { logger } from "./logger.js";
import { sortMonthlyRewards } from "./sortMonthlyRewards.js";
import { MONTH_NAMES } from "./monthNames.js";

const sanitizeKeyPart = (value) => {
  const key = String(value ?? "missing").trim();
  return key.length > 0 ? key.replace(/\s+/g, "-") : "missing";
};

const createUniqueRowKey = (baseKey, usedRowKeys) => {
  let rowKey = baseKey;
  let suffix = 1;

  while (usedRowKeys.has(rowKey)) {
    rowKey = `${baseKey}-${suffix}`;
    suffix += 1;
  }

  usedRowKeys.add(rowKey);
  return rowKey;
};

const getTransactionIdKey = (transactionId) => {
  if (typeof transactionId === "string" && transactionId.trim()) {
    return transactionId.trim();
  }

  if (typeof transactionId === "number" && Number.isFinite(transactionId)) {
    return String(transactionId);
  }

  return null;
};

const buildTransactionRowKey = (tx, index, usedRowKeys) => {
  const transactionIdKey = getTransactionIdKey(tx.transactionId);
  let baseKey = transactionIdKey;

  if (!baseKey) {
    logger.warn("Transaction is missing transactionId; using fallback row key.", {
      customerId: tx.customerId,
      index,
      purchaseDate: tx.purchaseDate,
    });

    baseKey = [
      "transaction",
      sanitizeKeyPart(tx.customerId),
      sanitizeKeyPart(tx.purchaseDate),
      index,
    ].join("-");
  } else if (usedRowKeys.has(baseKey)) {
    logger.warn("Duplicate transactionId detected; using fallback row key.", {
      index,
      transactionId: tx.transactionId,
    });
  }

  return createUniqueRowKey(baseKey, usedRowKeys);
};

const requireRewardPoints = (tx, context) => {
  if (!Number.isFinite(tx.rewardPoints)) {
    logger.error("Transaction is missing rewardPoints before aggregation.", {
      context,
      customerId: tx.customerId,
      transactionId: tx.transactionId,
    });
    throw new Error(
      `Transactions must be enriched before transactions are aggregated; before transactions are enriched for ${context}.`,
    );
  }

  return tx.rewardPoints;
};

export const enrichTransactionsWithRewards = (transactions) => {
  const usedRowKeys = new Set();

  return transactions.map((tx, index) => ({
    ...tx,
    rewardPoints: calculateRewardPoints(tx.purchaseAmount),
    rowKey: buildTransactionRowKey(tx, index, usedRowKeys),
  }));
};

const parsePurchaseDate = (purchaseDate) => new Date(purchaseDate);

const getPurchaseDateParts = (purchaseDate) => {
  const date = parsePurchaseDate(purchaseDate);
  if (Number.isNaN(date.getTime())) return null;

  return {
    monthIndex: date.getMonth(),
    year: date.getFullYear(),
  };
};

const monthlyKey = (customerId, year, monthIndex) =>
  `${customerId}|${year}|${monthIndex}`;

export const aggregateMonthlyRewards = (transactions) => {
  const byKey = transactions.reduce((acc, tx) => {
    const add = requireRewardPoints(tx, "monthly rewards");
    if (add === null) {
      return acc;
    }
    const dateParts = getPurchaseDateParts(tx.purchaseDate);
    if (!dateParts) {
      logger.warn("Skipping transaction with invalid purchaseDate.", {
        purchaseDate: tx.purchaseDate,
        transactionId: tx.transactionId,
      });
      return acc;
    }

    const { monthIndex, year } = dateParts;
    const key = monthlyKey(tx.customerId, year, monthIndex);
    const prev = acc[key];
    if (!prev) {
      acc[key] = {
        customerId: tx.customerId,
        customerName: tx.customerName,
        month: MONTH_NAMES[monthIndex],
        rowKey: `${sanitizeKeyPart(tx.customerId)}-${year}-${MONTH_NAMES[monthIndex]}`,
        year,
        rewardPoints: add,
      };
    } else {
      acc[key] = {
        ...prev,
        rewardPoints: prev.rewardPoints + add,
      };
    }
    return acc;
  }, {});

  return sortMonthlyRewards(Object.values(byKey));
};

export const aggregateTotalRewardsByCustomer = (transactions) => {
  const byCustomer = transactions.reduce((acc, tx) => {
    const id = tx.customerId;
    const prev = acc[id];
    const add = requireRewardPoints(tx, "total rewards");
    if (add === null) {
      return acc;
    }
    if (!prev) {
      acc[id] = {
        customerId: id,
        customerName: tx.customerName,
        rowKey: sanitizeKeyPart(id),
        totalRewardPoints: add,
      };
    } else {
      acc[id] = {
        ...prev,
        totalRewardPoints: prev.totalRewardPoints + add,
      };
    }
    return acc;
  }, {});

  return Object.values(byCustomer).sort((a, b) =>
    a.customerName.localeCompare(b.customerName),
  );
};
