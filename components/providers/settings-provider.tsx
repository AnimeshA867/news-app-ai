"use client";

import React, { createContext, useContext, ReactNode } from "react";

export interface SiteSettings {
  siteName: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  socialImageUrl: string | null;
  twitterImageUrl: string | null;
  facebookImageUrl: string | null;
  siteUrl: string | null;
  enableNewsletter: boolean;
  senderEmail: string | null;
  senderName: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
}

interface SettingsContextType {
  settings: SiteSettings;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export function SettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: any;
}) {
  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
}
