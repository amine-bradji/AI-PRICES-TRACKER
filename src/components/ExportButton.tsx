"use client";

interface Props {
  regionCode?: string;
  providerId?: string;
  freeOnly?: boolean;
}

export function ExportButton({ regionCode, providerId, freeOnly }: Props) {
  function buildUrl() {
    const params = new URLSearchParams();
    if (regionCode) params.set("region", regionCode);
    if (providerId) params.set("provider", providerId);
    if (freeOnly) params.set("freeOnly", "1");
    return `/api/export?${params.toString()}`;
  }

  return (
    <a
      href={buildUrl()}
      download
      className="chip flex items-center gap-1.5 hover:!border-brand-500/50 hover:!text-brand-300"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </a>
  );
}
