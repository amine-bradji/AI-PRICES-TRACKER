"use client";

interface Props {
  monthlyUsd: number;
  annualUsd: number | undefined;
  annualUsdEquivalent?: number;
}

/**
 * Shows the savings percentage when paying annually vs monthly. Only renders
 * when there is an actual discount.
 */
export function SavingsBadge({ monthlyUsd, annualUsd, annualUsdEquivalent }: Props) {
  if (!annualUsd || annualUsd >= monthlyUsd * 12 || monthlyUsd <= 0) return null;

  const annualMonthly = (annualUsdEquivalent ?? annualUsd) / 12;
  const savingsPct = Math.round((1 - annualMonthly / monthlyUsd) * 100);
  const savingsUsd = Math.round((monthlyUsd - annualMonthly) * 100) / 100;

  if (savingsPct <= 0) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
      style={{
        borderColor: "var(--ok)",
        color: "var(--ok)",
        backgroundColor: "var(--ok-bg)",
      }}
    >
      Save {savingsPct}%
      <span style={{ opacity: 0.75 }}>${savingsUsd}/mo</span>
    </span>
  );
}
