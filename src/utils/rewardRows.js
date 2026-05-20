export const withMonthlyRowKeys = (rows) =>
  rows.map((row) => ({
    ...row,
    rowKey: `${row.customerId}-${row.year}-${row.month}`,
  }));

export const withTotalRowKeys = (rows) =>
  rows.map((row) => ({
    ...row,
    rowKey: row.customerId,
  }));

export const withTransactionRowKeys = (rows) =>
  rows.map((row) => ({
    ...row,
    rowKey: row.transactionId,
  }));
