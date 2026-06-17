/** Display helpers for money + time. Client-safe (no Node APIs). */

export function formatLocalPrice(amount: number, currency: string, symbol: string): string {
  if (amount === 0) return "Free";
  // JPY/KRW/etc. have no fractional units — don't show decimals there.
  const zeroDecimal = ["JPY", "KRW", "IDR", "VND", "CLP", "HUF"].includes(currency);
  const opts: Intl.NumberFormatOptions = {
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  };
  const num = new Intl.NumberFormat("en-US", opts).format(amount);
  return `${symbol}${num}`;
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
