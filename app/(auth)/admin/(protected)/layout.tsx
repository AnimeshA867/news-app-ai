import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata = {
  title: "Admin Dashboard | NewsHub",
  description: "NewsHub content management system",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen  container mx-auto">
        <AdminSidebar />
        <div className="flex-1 mx-auto">
          <AdminHeader />
          <div className="p-6 container mx-auto flex justify-center">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
