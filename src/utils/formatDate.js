
export const formatPurchaseDate = (isoString, locale) => {
  const resolvedLocale =
    locale ??
    (typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en-US');

  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(resolvedLocale, { dateStyle: 'medium' }).format(
    d,
  );
};
