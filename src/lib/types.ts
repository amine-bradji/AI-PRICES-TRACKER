// Core domain types shared across the app.

/** A world region/country the tracker can report prices for. */
export interface Region {
  /** ISO-ish code, e.g. "US", "KR". */
  code: string;
  /** Human name, e.g. "South Korea". */
  name: string;
  /** ISO 4217 currency code, e.g. "KRW". */
  currency: string;
  /** Currency symbol for display, e.g. "₩". */
  symbol: string;
  /** Approximate static USD->local rate used only as a fallback when live FX fails. */
  fallbackRate: number;
  /** Emoji flag for quick visual scan in the UI. */
  flag: string;
}

/** Billing cadence for a tier. */
export type BillingCycle = "monthly" | "annual";

/** A subscription tier offered by a provider. */
export interface Tier {
  /** Internal id, unique within a provider. */
  id: string;
  /** Display name, e.g. "Plus", "Pro". */
  name: string;
  /** Base USD price per billing cycle. 0 means genuinely free. */
  usdPrice: number;
  billingCycle: BillingCycle;
  /**
   * Optional annual USD price (billed once per year). When present, the UI can
   * show the effective monthly cost of paying annually. Omit if no annual plan.
   */
  annualUsdPrice?: number;
  /** Whether this tier has a genuinely free (no payment) path. */
  isFree: boolean;
  /** Short marketing-style blurb. */
  blurb: string;
}

/** A recognized AI provider/brand. */
export interface Provider {
  /** Internal id, e.g. "openai". */
  id: string;
  /** Display name, e.g. "ChatGPT". */
  name: string;
  /** Brand color (hex) used for accents in the UI. */
  color: string;
  /** Short tagline. */
  tagline: string;
  /** Available tiers. */
  tiers: Tier[];
}

/**
 * A region-specific special offer layered on top of a provider's default tiers.
 * This is how regional free deals (e.g. "free in Korea") are represented.
 */
export interface RegionalOffer {
  /** Provider id this offer belongs to. */
  providerId: string;
  /** Optional tier id this offer overrides. If omitted, it is a standalone promo. */
  tierId?: string;
  /** Region code this offer applies to. */
  regionCode: string;
  /** Headline shown in the free-offer banner, e.g. "Free Pro access". */
  headline: string;
  /** Override price in local currency (0 = free). Omit to keep tier pricing. */
  localPrice?: number;
  /** Marks the offer as genuinely free (no payment required). */
  isFree: boolean;
  /** Optional expiry note, e.g. "until Dec 2026". */
  note?: string;
  /** Where the info came from (for the disclaimer). */
  source?: string;
}

/** A single computed offer row for one provider + region. */
export interface ComputedOffer {
  providerId: string;
  providerName: string;
  providerColor: string;
  tierId: string;
  tierName: string;
  regionCode: string;
  /** Price in local currency, or 0 if free. */
  localPrice: number;
  /** Price converted back to USD for comparison. */
  usdEquivalent: number;
  currency: string;
  symbol: string;
  billingCycle: BillingCycle;
  isFree: boolean;
  /** Annual price in local currency, if an annual plan exists. */
  annualLocalPrice?: number;
  /** Annual price converted back to USD, if an annual plan exists. */
  annualUsdEquivalent?: number;
  /** If a regional special applies, its headline + note. */
  regionalHeadline?: string;
  regionalNote?: string;
}

/** Result of an Update refresh. */
export interface UpdateResult {
  ok: boolean;
  /** Unix ms timestamp of the refresh. */
  updatedAt: number;
  /** Source of the FX rates actually used. */
  fxSource: "live" | "fallback";
  /** Number of currency pairs fetched. */
  rateCount: number;
  /** Seconds remaining before the next Update is allowed. */
  cooldownRemaining: number;
  /** Populated when the refresh failed for some reason. */
  message?: string;
}
