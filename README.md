# AI Price Tracker

Monitor AI subscription prices across world regions, convert them to local currency, and spot free regional offers — refreshed on demand via a rate-limited **Update** button.

## Features

- 🌍 **24 regions** with local-currency conversion via live FX rates
- 🧩 **7 providers**: ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok, DeepSeek
- 🎁 **Free-offer highlighting** — regional free deals get a dedicated banner (the "free ChatGPT Pro in Korea" style offers)
- 💸 **Cheapest-paid-per-provider** summary for the selected region
- 🔎 **Filter** by region, provider, and free-only
- 🛡️ **Rate-limited Update button** (≈60s server-side cooldown) so upstream servers are never overloaded
- 🌗 Modern dark-mode, responsive UI

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — one codebase for front and back
- **Tailwind CSS** — styling
- **No database** — pricing source of truth is a curated TypeScript module (`src/data/catalog.ts`); exchange rates are cached in-memory and refreshed by the Update button

## Getting started

```bash
cd ai-price-tracker
npm install
npm run dev
```

Open http://localhost:3000

## How data works

There is **no live scraping and no database**. Pricing lives in:

- `src/data/catalog.ts` — providers, tiers (USD base prices), and regional special offers
- `src/data/regions.ts` — supported regions + their currencies and fallback FX rates

The **Update** button is the only thing that hits the network: it pulls live USD-based exchange rates from the free, key-less `open.er-api.com` API, recomputes every region's local price, re-flags free offers, and stamps a new "updated at" time. The route enforces a server-side cooldown so repeated clicks don't spam upstream.

If the network is unavailable, the app falls back to bundled static rates and labels the data source as `offline`.

## Editing prices

To correct any price or add an offer, edit `src/data/catalog.ts`:

```ts
// Edit a tier price
{ id: "plus", name: "Plus", usdPrice: 20, billingCycle: "monthly", isFree: false, blurb: "..." }

// Add a regional free offer
{
  providerId: "openai",
  tierId: "pro",
  regionCode: "KR",
  headline: "Free Pro access promotion",
  localPrice: 0,
  isFree: true,
  note: "Verify on OpenAI's site",
}
```

Save and the change propagates everywhere on the next render.

## API

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/regions` | List of regions + freshness info |
| GET | `/api/offers?region=&provider=&freeOnly=` | Computed, filtered offers |
| POST | `/api/update` | Refresh exchange rates (cooldown-protected) |

## Disclaimer

Seed prices are **realistic demo values**, not pulled from live provider pages. AI pricing changes frequently and varies by promotion. The regional free offers are illustrative examples of the kind of deals this tracker surfaces — verify availability on each provider's site before relying on them.

## Configuration (`.env`)

```
FX_API_BASE=https://open.er-api.com/v6/latest/USD   # override FX source
UPDATE_COOLDOWN_SECONDS=60                           # min seconds between updates
```
