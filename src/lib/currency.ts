/**
 * Namibian Dollar currency formatting utility.
 * All prices across MaDe Market flow through this formatter.
 */

const formatter = new Intl.NumberFormat("en-NA", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Namibian Dollars — e.g. N$ 34.99 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "N$ 0.00";
  return `N$ ${formatter.format(num)}`;
}

/** Format a price range — e.g. N$ 12.99 — N$ 34.99 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatCurrency(min)} — ${formatCurrency(max)}`;
}

/** Calculate savings percentage */
export function savingsPercent(expensive: number, cheap: number): number {
  if (expensive <= 0) return 0;
  return Math.round(((expensive - cheap) / expensive) * 100);
}
