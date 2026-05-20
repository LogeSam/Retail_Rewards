const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getMonthIndexByName = (monthName) =>
  MONTH_NAMES.indexOf(monthName);

export const extractIdNumber = (id) => {
  const s = String(id);
  const m = s.match(/(\d+)$/);
  return m ? Number(m[1]) : NaN;
};

const compareMonthlyRewards = (a, b) => {
  const aNum = extractIdNumber(a.customerId);
  const bNum = extractIdNumber(b.customerId);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
    return aNum - bNum;
  }

  const idCompare = String(a.customerId).localeCompare(String(b.customerId));
  if (idCompare !== 0) return idCompare;

  if (a.year !== b.year) return a.year - b.year;

  return getMonthIndexByName(a.month) - getMonthIndexByName(b.month);
};

export const sortMonthlyRewards = (arr) => [...arr].sort(compareMonthlyRewards);
