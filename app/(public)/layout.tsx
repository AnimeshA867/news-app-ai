import React from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
      <CookieConsent />
    </main>
  );
}
