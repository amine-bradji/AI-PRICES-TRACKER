"use client";

import { useCallback, useEffect, useState } from "react";

type Mode = "light" | "dark";

/**
 * The single source of truth for the active theme is the `dark` class on
 * <html>, which is set before paint by the inline script in layout.tsx.
 *
 * - The toggle starts as `null` so server and client render the same UI and
 *   there is no hydration mismatch. After mount we read the real state.
 * - The body (and every themed surface) animates color/background-color via
 *   a 220ms crossfade, so flipping the mode is smooth, not a hard cut.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  // Crossfade tweak: if the user changes theme, briefly disable transitions on
  // the root so background swaps cleanly even if other transitions are in
  // flight. The body-level transition is the primary mechanism; this just
  // prevents stray mid-animation flashes on deeply nested elements.
  const apply = useCallback((next: Mode) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore storage failures
    }
    // Remove the lock on the next frame so the crossfade can play normally.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.remove("theme-switching"));
    });
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    apply(next);
  }

  const isDark = mode === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className="btn h-9 w-9 px-0 py-0"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
