"use client";

import { UpdateButton } from "@/components/UpdateButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Props {
  updatedAt: number;
  cooldown: number;
  updating: boolean;
  fxSource: "live" | "fallback" | null;
  onUpdate: () => void;
}

export function Header({ updatedAt, cooldown, updating, fxSource, onUpdate }: Props) {
  return (
    <header className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-2xl shadow-lg shadow-brand-500/30">
          🤖
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            AI Price Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor AI subscriptions worldwide · spot free offers
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UpdateButton
          onClick={onUpdate}
          updating={updating}
          cooldown={cooldown}
          updatedAt={updatedAt}
          fxSource={fxSource}
        />
      </div>
    </header>
  );
}
