
export const calculateRewardPoints = (amount) => {
  const n = Number(amount)
  if (!Number.isFinite(n) || n < 0) return 0
  const d = Math.floor(n)
  const pointsBetween50And100 = Math.max(0, Math.min(d, 100) - 50)
  const pointsAbove100 = Math.max(0, d - 100) * 2
  return pointsBetween50And100 + pointsAbove100
}
