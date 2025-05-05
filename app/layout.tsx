import type React from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

import "./globals.css";
import Session from "@/components/session-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: {
    default: "NewsHub - Breaking News & Latest Headlines",
    template: "%s | NewsHub",
  },
  description:
    "Get the latest breaking news and top stories from around the world.",
  keywords: [
    "news",
    "breaking news",
    "headlines",
    "politics",
    "world",
    "business",
  ],
  authors: [{ name: "NewsHub" }],
  creator: "NewsHub",
  publisher: "NewsHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newshub.vercel.app",
    title: "NewsHub - Breaking News & Latest Headlines",
    description:
      "Get the latest breaking news and top stories from around the world.",
    siteName: "NewsHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsHub - Breaking News & Latest Headlines",
    description:
      "Get the latest breaking news and top stories from around the world.",
    creator: "@newshub",
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Session>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Suspense>{children}</Suspense>
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </Session>
  );
}
