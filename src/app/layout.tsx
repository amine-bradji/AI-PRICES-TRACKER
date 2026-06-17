import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Price Tracker — Monitor AI subscriptions worldwide",
  description:
    "Track AI subscription prices across world regions, convert to local currency, and spot free offers — refreshed on demand.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
