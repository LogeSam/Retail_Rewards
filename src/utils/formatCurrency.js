import { logger } from './logger.js'

export const formatCurrency = (
  value,
  locale = undefined,
  currency = 'USD',
  fallback = '—',
) => {
  if (value === undefined || value === null) {
    logger.warn('Invalid currency value.', { value })
    return fallback
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    logger.warn('Invalid currency value.', { value })
    return fallback
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}
