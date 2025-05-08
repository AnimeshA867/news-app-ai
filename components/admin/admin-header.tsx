"use client";

import React from "react";
import Link from "next/link";
import { User, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useSettings } from "@/components/providers/settings-provider";

export function AdminHeader() {
  const { settings } = useSettings();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur pl-16">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <div className="rounded-full bg-primary p-1">
              <span className="text-sm font-bold text-primary-foreground">
                {settings.siteName.charAt(0)}
              </span>
            </div>
            <span>{settings.siteName} Admin</span>
          </Link>
        </div>

        {/* Rest of the component... */}
      </div>
    </header>
  );
}
