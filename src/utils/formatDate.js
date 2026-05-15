
export const formatPurchaseDate = (
  isoString,
  locale =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en-US',
) => {
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d)
}
