import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Self-hosted, render-optimized font with size-adjust fallback metrics (no CLS).
// Exposed as the --font-sans CSS variable that globals.css / tailwind already use.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const title = "AI Price Tracker — Monitor AI subscriptions worldwide";
const description =
  "Track AI subscription prices across world regions, convert to local currency, and spot free offers — refreshed on demand.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  applicationName: "AI Price Tracker",
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", url: "/", siteName: "AI Price Tracker" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

// Runs synchronously in <head> before first paint: resolve the saved/system
// theme and apply the `dark` class to <html> so the very first frame is already
// the correct theme — no flash, no post-hydration swap.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Runs before the body paints — sets the correct theme class, no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
