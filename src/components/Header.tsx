"use client";

import { memo } from "react";
import { UpdateButton } from "@/components/UpdateButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Props {
  updatedAt: number;
  cooldown: number;
  updating: boolean;
  fxSource: "live" | "fallback" | null;
  onUpdate: () => void;
}

function HeaderBase({ updatedAt, cooldown, updating, fxSource, onUpdate }: Props) {
  return (
    <header className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-subtle text-sm font-semibold tracking-tight text-ink-primary"
          aria-hidden="true"
        >
          AI
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink-primary sm:text-xl">
            AI Price Tracker
          </h1>
          <p className="truncate text-sm text-ink-secondary">
            Monitor AI subscription prices worldwide and spot regional free offers.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
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

export const Header = memo(HeaderBase);
