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
      <div className="flex flex-col min-h-screen">
        <AdminSidebar />
        <div className="flex-1 w-full max-w-full overflow-x-hidden container ">
          <AdminHeader />
          <div className="p-2 sm:p-4 md:p-6 mx-auto w-full mt-2">
            <div className="w-full overflow-x-auto container">{children}</div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
