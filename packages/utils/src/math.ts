/**
 * Calculates gross amount from a net amount when percentage and flat fees apply.
 * Formula: gross = (net + flatFee) / (1 - feePercent / 100)
 */
export function calculateGrossFromNet(
  netAmount: number,
  feePercent: number,
  flatFee: number = 0,
): number {
  if (feePercent >= 100) {
    throw new Error("Fee percentage cannot be 100% or greater");
  }
  const rate = 1 - feePercent / 100;
  return Math.round(((netAmount + flatFee) / rate) * 100) / 100;
}
