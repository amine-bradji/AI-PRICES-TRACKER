import type { Region } from "@/lib/types";

/**
 * Regions the tracker reports prices for.
 * `fallbackRate` is a rough USD->local snapshot used ONLY if the live FX call
 * fails. It is intentionally conservative and not meant to be authoritative.
 */
export const REGIONS: Region[] = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", fallbackRate: 1, flag: "🇺🇸" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", fallbackRate: 1.36, flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", fallbackRate: 0.79, flag: "🇬🇧" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€", fallbackRate: 0.92, flag: "🇩🇪" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€", fallbackRate: 0.92, flag: "🇫🇷" },
  { code: "ES", name: "Spain", currency: "EUR", symbol: "€", fallbackRate: 0.92, flag: "🇪🇸" },
  { code: "IT", name: "Italy", currency: "EUR", symbol: "€", fallbackRate: 0.92, flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", currency: "EUR", symbol: "€", fallbackRate: 0.92, flag: "🇳🇱" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$", fallbackRate: 5.4, flag: "🇧🇷" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "Mex$", fallbackRate: 18.2, flag: "🇲🇽" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", fallbackRate: 157, flag: "🇯🇵" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩", fallbackRate: 1370, flag: "🇰🇷" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥", fallbackRate: 7.25, flag: "🇨🇳" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", fallbackRate: 83.5, flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp", fallbackRate: 16200, flag: "🇮🇩" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", fallbackRate: 1.51, flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$", fallbackRate: 1.64, flag: "🇳🇿" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$", fallbackRate: 1.35, flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "AED", fallbackRate: 3.67, flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "SAR", fallbackRate: 3.75, flag: "🇸🇦" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R", fallbackRate: 18.6, flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦", fallbackRate: 1485, flag: "🇳🇬" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "₺", fallbackRate: 32.5, flag: "🇹🇷" },
  { code: "RU", name: "Russia", currency: "RUB", symbol: "₽", fallbackRate: 88, flag: "🇷🇺" },
];

/** O(1) lookup of a region by its code. Built once at module load. */
export const REGION_BY_CODE: ReadonlyMap<string, Region> = new Map(
  REGIONS.map((r) => [r.code, r]),
);

export function regionByCode(code: string): Region | undefined {
  return REGION_BY_CODE.get(code);
}
