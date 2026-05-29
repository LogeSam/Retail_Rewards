import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  aggregateMonthlyRewards,
  aggregateTotalRewardsByCustomer,
  enrichTransactionsWithRewards,
} from "../utils/aggregateRewards.js";

const baseTx = (overrides) => ({
  transactionId: "t1",
  customerId: "c1",
  customerName: "Alice",
  purchaseDate: "2024-01-15T15:00:00.000Z",
  productPurchased: "Widget",
  purchaseAmount: 120,
  ...overrides,
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("enrichTransactionsWithRewards", () => {
  it("adds rewardPoints per rules", () => {
    const out = enrichTransactionsWithRewards([
      baseTx({ purchaseAmount: 120 }),
    ]);
    expect(out[0].rewardPoints).toBe(90);
    expect(out[0].rowKey).toBe("t1");
  });

  it("generates fallback row keys for malformed transaction ids", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    const out = enrichTransactionsWithRewards([
      baseTx({ transactionId: "" }),
      baseTx({ transactionId: "duplicate" }),
      baseTx({ transactionId: "duplicate" }),
    ]);

    expect(out[0].rowKey).toMatch(
      /^transaction-c1-2024-01-15T15:00:00.000Z-0$/,
    );
    expect(out[1].rowKey).toBe("duplicate");
    expect(out[2].rowKey).toBe("duplicate-1");
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});

describe("aggregateMonthlyRewards", () => {
  it("sums by customer month year and sorts by customer year month", () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        transactionId: "a",
        customerId: "c2",
        customerName: "Bob",
        purchaseDate: "2023-12-15T15:00:00.000Z",
        purchaseAmount: 60,
      }),
      baseTx({
        transactionId: "b",
        customerId: "c1",
        customerName: "Alice",
        purchaseDate: "2024-01-10T15:00:00.000Z",
        purchaseAmount: 120,
      }),
      baseTx({
        transactionId: "c",
        customerId: "c1",
        customerName: "Alice",
        purchaseDate: "2024-01-20T15:00:00.000Z",
        purchaseAmount: 50,
      }),
    ]);
    const monthly = aggregateMonthlyRewards(txs);
    expect(monthly.length).toBe(2);
    expect(monthly[0].year).toBe(2024);
    expect(monthly[0].month).toBe("January");
    expect(monthly[0].customerId).toBe("c1");
    expect(monthly[0].rewardPoints).toBe(90);
    expect(monthly[1].year).toBe(2023);
    expect(monthly[1].month).toBe("December");
    expect(monthly[1].customerId).toBe("c2");
    expect(monthly[1].rewardPoints).toBe(10);
  });

  it("ignores invalid dates", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    const txs = enrichTransactionsWithRewards([
      baseTx({ purchaseDate: "not-a-date", purchaseAmount: 120 }),
    ]);
    expect(aggregateMonthlyRewards(txs)).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "Skipping transaction with invalid purchaseDate.",
      expect.objectContaining({ purchaseDate: "not-a-date" }),
    );
  });

  it("throws when transactions have not been enriched", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => aggregateMonthlyRewards([baseTx()])).toThrow(
      /before transactions are enriched/i,
    );
  });

  it("keeps same month in different years as separate summaries", () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        transactionId: "jan-2024",
        purchaseDate: "2024-01-15T15:00:00.000Z",
        purchaseAmount: 120,
      }),
      baseTx({
        transactionId: "jan-2025",
        purchaseDate: "2025-01-15T15:00:00.000Z",
        purchaseAmount: 100,
      }),
    ]);

    expect(aggregateMonthlyRewards(txs)).toEqual([
      {
        customerId: "c1",
        customerName: "Alice",
        month: "January",
        rowKey: "c1-2024-January",
        rewardPoints: 90,
        year: 2024,
      },
      {
        customerId: "c1",
        customerName: "Alice",
        month: "January",
        rowKey: "c1-2025-January",
        rewardPoints: 50,
        year: 2025,
      },
    ]);
  });

  it("sorts monthly summaries by customer, year, and month", () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        transactionId: "c2-mar-2025",
        customerId: "c2",
        customerName: "Bob",
        purchaseDate: "2025-03-10T15:00:00.000Z",
        purchaseAmount: 120,
      }),
      baseTx({
        transactionId: "c1-jan-2024",
        customerId: "c1",
        customerName: "Alice",
        purchaseDate: "2024-01-10T15:00:00.000Z",
        purchaseAmount: 120,
      }),
      baseTx({
        transactionId: "c2-jan-2024",
        customerId: "c2",
        customerName: "Bob",
        purchaseDate: "2024-01-20T15:00:00.000Z",
        purchaseAmount: 50,
      }),
    ]);

    expect(
      aggregateMonthlyRewards(txs).map(
        (row) => `${row.year}-${row.month}-${row.customerId}`,
      ),
    ).toEqual(["2024-January-c1", "2024-January-c2", "2025-March-c2"]);
  });
});

describe("aggregateTotalRewardsByCustomer", () => {
  it("sums totals and sorts by name", () => {
    const txs = enrichTransactionsWithRewards([
      baseTx({
        customerId: "c2",
        customerName: "Zed",
        purchaseAmount: 100,
      }),
      baseTx({
        transactionId: "t2",
        customerId: "c1",
        customerName: "Alice",
        purchaseAmount: 100,
      }),
    ]);
    const totals = aggregateTotalRewardsByCustomer(txs);
    expect(totals).toEqual([
      {
        customerId: "c1",
        customerName: "Alice",
        rowKey: "c1",
        totalRewardPoints: 50,
      },
      {
        customerId: "c2",
        customerName: "Zed",
        rowKey: "c2",
        totalRewardPoints: 50,
      },
    ]);
  });

  it("throws when total aggregation receives raw transactions", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => aggregateTotalRewardsByCustomer([baseTx()])).toThrow(
      /before transactions are enriched/i,
    );
  });
});
