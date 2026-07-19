import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RouteTransitionProvider } from "./route-transition";

export const metadata: Metadata = {
  title: "ELSEWHERE — Independent products, verified for sourcing",
  description: "Explore six independent product worlds and send a personal sourcing request.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070707",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><RouteTransitionProvider>{children}</RouteTransitionProvider></body>
    </html>
  );
}
