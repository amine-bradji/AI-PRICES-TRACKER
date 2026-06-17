import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs — AI Price Tracker",
  description: "REST API reference for the AI Price Tracker.",
};

export default function DocsPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/regions",
      description: "List all supported regions with their currencies and fallback FX rates.",
      response: `{
  "regions": [
    { "code": "US", "name": "United States", "currency": "USD", "symbol": "$", "fallbackRate": 1, "flag": "🇺🇸" }
  ],
  "updatedAt": 1718563200000,
  "cooldownRemaining": 42
}`,
    },
    {
      method: "GET",
      path: "/api/offers",
      description:
        "Compute and return all offers, optionally filtered by region, provider, and free-only flag.",
      params: [
        { name: "region", type: "string", example: "KR", description: "Filter to a single region code." },
        { name: "provider", type: "string", example: "openai", description: "Filter to a single provider id." },
        { name: "freeOnly", type: "boolean", example: "true", description: "Only return free offers." },
      ],
      response: `{
  "updatedAt": 1718563200000,
  "cooldownRemaining": 42,
  "fxSource": "live",
  "providers": [{ "id": "openai", "name": "ChatGPT", "color": "#10a37f" }],
  "offers": [{ "providerId": "openai", "tierName": "Plus", "localPrice": 27000, "usdEquivalent": 20, "currency": "KRW", "isFree": false }],
  "freeHighlights": [{ "providerId": "openai", "regionCode": "KR", "isFree": true, "regionalHeadline": "Free Pro access promotion" }],
  "cheapestPaid": [{ "providerId": "openai", "usdEquivalent": 20 }],
  "stats": { "providerCount": 7, "offerCount": 21, "freeCount": 8 }
}`,
    },
    {
      method: "POST",
      path: "/api/update",
      description:
        "Refresh live exchange rates. Enforces a server-side cooldown (~60s). Returns the new state without hitting the network if cooldown is active.",
      response: `{
  "ok": true,
  "updatedAt": 1718563200000,
  "fxSource": "live",
  "rateCount": 166,
  "cooldownRemaining": 60
}`,
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">API Documentation</h1>
      <p className="mb-8 text-slate-500 dark:text-slate-400">
        The AI Price Tracker exposes a small REST API for programmatic access to pricing data.
        All responses are JSON. The <code className="text-brand-400">POST /api/update</code> endpoint is
        rate-limited to prevent upstream server abuse.
      </p>

      <div className="flex flex-col gap-6">
        {endpoints.map((ep) => (
          <section key={ep.path} className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-white dark:bg-slate-900/40 px-5 py-3">
              <MethodBadge method={ep.method} />
              <code className="font-mono text-sm font-semibold text-white">{ep.path}</code>
            </div>
            <div className="p-5">
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{ep.description}</p>

              {"params" in ep && ep.params && (
                <div className="mb-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Query Parameters
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-slate-400 dark:text-slate-500">
                        <th className="pb-1 pr-4 font-medium">Name</th>
                        <th className="pb-1 pr-4 font-medium">Type</th>
                        <th className="pb-1 pr-4 font-medium">Example</th>
                        <th className="pb-1 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr key={p.name}>
                          <td className="py-1 pr-4 font-mono text-brand-400">{p.name}</td>
                          <td className="py-1 pr-4 text-slate-400 dark:text-slate-500">{p.type}</td>
                          <td className="py-1 pr-4 text-slate-500 dark:text-slate-400">{p.example}</td>
                          <td className="py-1 text-slate-600 dark:text-slate-300">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Response (200)
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-white dark:bg-slate-950 p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {ep.response}
              </pre>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300">
        <strong>Rate limiting:</strong> The <code>POST /api/update</code> endpoint enforces a
        ~60-second server-side cooldown. If called during cooldown, it returns the current state
        without making a network request. Abuse protection is automatic — no API key needed.
      </div>
    </main>
  );
}

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "GET"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-brand-500/15 text-brand-300 border-brand-500/30";
  return (
    <span className={`rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${color}`}>
      {method}
    </span>
  );
}
