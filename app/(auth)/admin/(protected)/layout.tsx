import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";

export async function generateMetadata() {
  const settings = (await prisma.setting.findFirst()) || {
    siteName: "NewsHub",
  };

  return {
    title: `Admin Dashboard | ${settings.siteName}`,
    description: `${settings.siteName} content management system`,
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col md:flex-row min-h-screen w-full ">
        <div className="md:block mr-12">
          <AdminSidebar />
        </div>

        <div className="flex-1 flex flex-col min-h-screen w-full  ">
          <AdminHeader />
          <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl w-full mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
