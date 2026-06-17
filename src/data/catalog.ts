import type { Provider, RegionalOffer } from "@/lib/types";

/**
 * CURATED PROVIDER CATALOG — the source of truth for pricing.
 *
 * Prices are community-curated demo values, NOT pulled from live provider pages.
 * AI pricing changes frequently and varies by billing/promo. To correct a figure,
 * just edit the value below. Everything downstream (local-currency conversion,
 * free-offer highlighting, comparisons) recomputes automatically on the next Update.
 *
 * Last manual review: see git history.
 */
export const PROVIDERS: Provider[] = [
  {
    id: "openai",
    name: "ChatGPT",
    color: "#10a37f",
    tagline: "OpenAI's flagship assistant",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Limited GPT access, standard model." },
      { id: "plus", name: "Plus", usdPrice: 20, annualUsdPrice: 200, billingCycle: "monthly", isFree: false, blurb: "Higher limits, advanced models." },
      { id: "pro", name: "Pro", usdPrice: 200, annualUsdPrice: 1920, billingCycle: "monthly", isFree: false, blurb: "Near-unlimited access to top models." },
      { id: "team", name: "Team", usdPrice: 25, annualUsdPrice: 300, billingCycle: "monthly", isFree: false, blurb: "Per-seat, shared workspace." },
    ],
  },
  {
    id: "anthropic",
    name: "Claude",
    color: "#d97757",
    tagline: "Anthropic's Claude assistant",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Limited daily messages." },
      { id: "pro", name: "Pro", usdPrice: 20, annualUsdPrice: 200, billingCycle: "monthly", isFree: false, blurb: "More messages, priority access." },
      { id: "max5", name: "Max 5x", usdPrice: 100, annualUsdPrice: 960, billingCycle: "monthly", isFree: false, blurb: "5x Pro usage." },
      { id: "max20", name: "Max 20x", usdPrice: 200, annualUsdPrice: 1920, billingCycle: "monthly", isFree: false, blurb: "20x Pro usage." },
    ],
  },
  {
    id: "google",
    name: "Gemini",
    color: "#4285f4",
    tagline: "Google's Gemini assistant",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Gemini in the browser." },
      { id: "advanced", name: "Advanced", usdPrice: 20, annualUsdPrice: 200, billingCycle: "monthly", isFree: false, blurb: "Gemini Advanced, 2TB storage." },
      { id: "premium", name: "AI Premium", usdPrice: 20, annualUsdPrice: 200, billingCycle: "monthly", isFree: false, blurb: "Google One AI Premium plan." },
    ],
  },
  {
    id: "copilot",
    name: "Copilot",
    color: "#0078d4",
    tagline: "Microsoft Copilot",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Copilot in Edge/Bing." },
      { id: "pro", name: "Pro", usdPrice: 20, annualUsdPrice: 200, billingCycle: "monthly", isFree: false, blurb: "Priority access, designer tools." },
      { id: "m365", name: "Microsoft 365", usdPrice: 30, annualUsdPrice: 300, billingCycle: "monthly", isFree: false, blurb: "Copilot in Office apps." },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#20b8cd",
    tagline: "Answer engine with citations",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Basic search." },
      { id: "pro", name: "Pro", usdPrice: 20, annualUsdPrice: 200, billingCycle: "monthly", isFree: false, blurb: "Unlimited Pro Search, model choice." },
    ],
  },
  {
    id: "xai",
    name: "Grok",
    color: "#111111",
    tagline: "xAI's Grok on X",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Limited Grok on grok.com." },
      { id: "premium", name: "Premium", usdPrice: 8, annualUsdPrice: 84, billingCycle: "monthly", isFree: false, blurb: "X Premium with Grok." },
      { id: "supergrok", name: "SuperGrok", usdPrice: 30, annualUsdPrice: 300, billingCycle: "monthly", isFree: false, blurb: "Highest limits, standalone." },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "#4d6bfe",
    tagline: "Open and cheap frontier models",
    tiers: [
      { id: "free", name: "Free", usdPrice: 0, billingCycle: "monthly", isFree: true, blurb: "Free chat tier." },
      { id: "plus", name: "Plus", usdPrice: 10, billingCycle: "monthly", isFree: false, blurb: "Higher rate limits." },
    ],
  },
];

/**
 * Region-specific special offers. This is where regional free deals live.
 *
 * DISCLAIMER: these are illustrative entries demonstrating the kind of regional
 * free/cheap offers the tracker is built to surface. They are NOT verified live
 * promotions. Replace with confirmed deals before relying on them.
 */
export const REGIONAL_OFFERS: RegionalOffer[] = [
  {
    providerId: "openai",
    tierId: "pro",
    regionCode: "KR",
    headline: "Free Pro access promotion",
    localPrice: 0,
    isFree: true,
    note: "Regional promotion — verify current availability on OpenAI's site",
    source: "community-curated (illustrative)",
  },
  {
    providerId: "openai",
    regionCode: "IN",
    headline: "Student discount on Plus",
    localPrice: 999,
    isFree: false,
    note: "Discounted local pricing for students",
    source: "community-curated (illustrative)",
  },
  {
    providerId: "google",
    tierId: "advanced",
    regionCode: "BR",
    headline: "Localized promo pricing",
    localPrice: 75,
    isFree: false,
    note: "Promotional BRL rate",
    source: "community-curated (illustrative)",
  },
  {
    providerId: "perplexity",
    regionCode: "JP",
    headline: "First month free trial",
    localPrice: 0,
    isFree: true,
    note: "Trial offer for new users",
    source: "community-curated (illustrative)",
  },
  {
    providerId: "deepseek",
    regionCode: "CN",
    headline: "Free domestic access",
    localPrice: 0,
    isFree: true,
    note: "Free chat access for local users",
    source: "community-curated (illustrative)",
  },
];

export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
