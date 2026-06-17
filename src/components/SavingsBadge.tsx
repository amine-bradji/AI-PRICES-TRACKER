"use client";

interface Props {
  monthlyUsd: number;
  annualUsd: number | undefined;
  annualUsdEquivalent?: number;
}

/**
 * Shows the savings percentage when paying annually vs monthly.
 * E.g. "Save 17%" with a green badge — only renders when there's an actual discount.
 */
export function SavingsBadge({ monthlyUsd, annualUsd, annualUsdEquivalent }: Props) {
  if (!annualUsd || annualUsd >= monthlyUsd * 12 || monthlyUsd <= 0) return null;

  const annualMonthly = (annualUsdEquivalent ?? annualUsd) / 12;
  const savingsPct = Math.round((1 - annualMonthly / monthlyUsd) * 100);
  const savingsUsd = Math.round((monthlyUsd - annualMonthly) * 100) / 100;

  if (savingsPct <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
      💰 Save {savingsPct}%
      <span className="text-emerald-400/70">${savingsUsd}/mo</span>
    </span>
  );
}
