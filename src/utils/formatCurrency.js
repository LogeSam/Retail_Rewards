export const formatCurrency = (
  value,
  locale = undefined,
  currency = 'USD',
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
