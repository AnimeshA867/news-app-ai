"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { RoleGate } from "@/components/admin/role-gate";
import { AccessDenied } from "@/components/admin/access-denied";
import { PermissionGuard } from "@/components/admin/permission-guard";
import SiteSettingsForm from "@/components/admin/settings/site-settings";

import GeneralSettingsTab from "@/components/admin/settings/general-settings";
import ProfileSettingsTab from "@/components/admin/settings/profile-settings";
import ApiSettingsTab from "@/components/admin/settings/api-settings";
import UserManagementTab from "@/components/admin/settings/user-management";

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { data: session } = useSession();
  const userRole = session?.user?.role || "";

  const isOwner = userRole === "OWNER";
  const isAdmin = userRole === "ADMIN" || isOwner;
  const isEditor = userRole === "EDITOR" || isAdmin;

  return (
    <PermissionGuard allowedRoles={["OWNER"]}>
      <div className="space-y-6 p-10 pb-16">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
          <p className="text-muted-foreground">
            Manage your website's global settings and configuration.
          </p>
        </div>
        <SiteSettingsForm />
      </div>
    </PermissionGuard>
  );
}
