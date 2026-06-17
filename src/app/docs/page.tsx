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
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-ink-primary">API documentation</h1>
      <p className="mb-8 text-sm text-ink-secondary">
        The AI Price Tracker exposes a small REST API for programmatic access to pricing data.
        All responses are JSON. The <code style={{ color: "var(--accent)" }}>POST /api/update</code> endpoint is
        rate-limited to prevent upstream server abuse.
      </p>

      <div className="flex flex-col gap-6">
        {endpoints.map((ep) => (
          <section key={ep.path} className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-hairline px-5 py-3">
              <MethodBadge method={ep.method} />
              <code className="font-mono text-sm font-semibold text-ink-primary">{ep.path}</code>
            </div>
            <div className="p-5">
              <p className="mb-4 text-sm text-ink-secondary">{ep.description}</p>

              {"params" in ep && ep.params && (
                <div className="mb-4">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                    Query parameters
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-ink-tertiary">
                        <th className="pb-1 pr-4 font-medium">Name</th>
                        <th className="pb-1 pr-4 font-medium">Type</th>
                        <th className="pb-1 pr-4 font-medium">Example</th>
                        <th className="pb-1 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr key={p.name}>
                          <td className="py-1 pr-4 font-mono text-ink-primary">{p.name}</td>
                          <td className="py-1 pr-4 text-ink-tertiary">{p.type}</td>
                          <td className="py-1 pr-4 text-ink-secondary">{p.example}</td>
                          <td className="py-1 text-ink-secondary">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                Response (200)
              </h3>
              <pre
                className="overflow-x-auto rounded-md border border-hairline p-4 font-mono text-xs leading-relaxed"
                style={{ backgroundColor: "var(--bg-subtle)", color: "var(--ink-secondary)" }}
              >
                {ep.response}
              </pre>
            </div>
          </section>
        ))}
      </div>

      <div
        className="mt-8 rounded-md border px-4 py-3 text-sm"
        style={{
          borderColor: "var(--warn)",
          color: "var(--warn)",
          backgroundColor: "var(--warn-bg)",
        }}
      >
        <strong>Rate limiting:</strong> The <code>POST /api/update</code> endpoint enforces a
        ~60-second server-side cooldown. If called during cooldown, it returns the current state
        without making a network request. Abuse protection is automatic — no API key needed.
      </div>
    </main>
  );
}

function MethodBadge({ method }: { method: string }) {
  const isGet = method === "GET";
  return (
    <span
      className="rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        borderColor: isGet ? "var(--ok)" : "var(--accent)",
        color: isGet ? "var(--ok)" : "var(--accent-ink)",
        backgroundColor: isGet ? "var(--ok-bg)" : "var(--accent-bg)",
      }}
    >
      {method}
    </span>
  );
}
