import React from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdPositionWrapper } from "@/components/advertisements/ad-position-wrapper";

export const revalidate = 60;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />

      {/* Header banner ad */}
      <div className="container mx-auto my-4">
        <AdPositionWrapper
          position="header"
          pageType="global"
          className="w-full h-[90px] flex items-center justify-center"
          fallback={null}
        />
      </div>

      <main>{children}</main>

      {/* Footer banner ad */}
      <div className="container mx-auto my-4">
        <AdPositionWrapper
          position="footer"
          pageType="global"
          className="w-full h-[90px] flex items-center justify-center"
          fallback={null}
        />
      </div>

      <SiteFooter />
    </>
  );
}
