import type React from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { prisma } from "@/lib/prisma";

import "./globals.css";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.setting.findFirst();

  // Set dynamic hostname
  const domain = settings?.siteUrl || "https://news.manasukh.com";

  // Define default values
  const siteName = settings?.siteName || "Manasukh News";
  const tagline = settings?.tagline || "Latest News & Updates";
  const description =
    settings?.description ||
    "Stay updated with the latest news and updates from around the world.";

  // Determine which image to use for each platform
  const facebookImage =
    settings?.facebookImageUrl ||
    settings?.socialImageUrl ||
    `${domain}/default-facebook-image.jpg`;

  const twitterImage =
    settings?.twitterImageUrl ||
    settings?.socialImageUrl ||
    `${domain}/default-twitter-image.jpg`;

  return {
    title: {
      default: `${siteName}${tagline ? ` - ${tagline}` : ""}`,
      template: `%s | ${siteName}`,
    },
    description: description,
    metadataBase: new URL(domain),
    openGraph: {
      type: "website",
      url: domain,
      title: `${siteName}${tagline ? ` - ${tagline}` : ""}`,
      description: description,
      siteName: siteName,
      images: [
        {
          url: facebookImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName}${tagline ? ` - ${tagline}` : ""}`,
      description: description,
      images: [
        {
          url: twitterImage,
          width: 1200,
          height: 600,
          alt: siteName,
        },
      ],
      creator: "@newsai",
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
    },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings from the database
  const settings = (await prisma.setting.findFirst()) || {
    siteName: "NewsHub",
    tagline: "Breaking News & Latest Headlines",
    description:
      "Get the latest breaking news and top stories from around the world.",
    logoUrl: null,
    faviconUrl: null,
    socialImageUrl: null,
    twitterImageUrl: null,
    facebookImageUrl: null,
    siteUrl: null,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}
      >
        <SettingsProvider settings={settings}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense>{children}</Suspense>
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
