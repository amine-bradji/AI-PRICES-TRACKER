/** Display helpers for money + time. Client-safe (no Node APIs). */

// Constructing an Intl.NumberFormat is far costlier than calling .format() on it
// (it does locale-data lookup each time). We render up to ~500 price cells per
// table render, so cache the two formatters we actually need and reuse them.
const decimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const zeroDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Currencies with no fractional units — don't show decimals there.
const ZERO_DECIMAL = new Set(["JPY", "KRW", "IDR", "VND", "CLP", "HUF"]);

export function formatLocalPrice(amount: number, currency: string, symbol: string): string {
  if (amount === 0) return "Free";
  const fmt = ZERO_DECIMAL.has(currency) ? zeroDecimalFormatter : decimalFormatter;
  return `${symbol}${fmt.format(amount)}`;
}

export function formatUsd(amount: number): string {
  if (amount === 0) return "Free";
  return `$${amount.toFixed(2)}`;
}

export function formatTime(unixMs: number): string {
  const d = new Date(unixMs);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Human "x seconds ago" style relative time. */
export function timeAgo(unixMs: number, now = Date.now()): string {
  const diff = Math.max(0, now - unixMs);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
