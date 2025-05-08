"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FileText,
  Folder,
  Tag,
  Users,
  Settings,
  MessageSquare,
  BarChart,
  FileQuestion,
  Mail,
  PanelLeft,
  Bell,
  Newspaper,
  Menu,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { UserNav } from "./user-nav";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarHeaderTitle,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSection,
  SidebarSectionTitle,
} from "@/components/ui/custom-sidebar";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "EDITOR";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Handle resize for mobile/desktop layouts
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Define different access levels based on user roles
  const isEditor = ["EDITOR", "ADMIN", "OWNER"].includes(userRole);
  const isAdmin = ["ADMIN", "OWNER"].includes(userRole);
  const isOwner = userRole === "OWNER";

  // Get role display information
  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "OWNER":
        return "bg-purple-500 text-white";
      case "ADMIN":
        return "bg-red-500 text-white";
      case "EDITOR":
        return "bg-blue-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  // Toggle sidebar visibility (for mobile devices)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Mobile toggle button - fixed position */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      )}

      <Sidebar
        className={`transition-all duration-300 ease-in-out  fixed top-0 left-0 z-40  shadow-lg  ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "w-[270px] md:w-60 fixed inset-0 top-0 " : "w-60 sticky"}`}
      >
        <SidebarHeader className="border-b px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Newspaper className="h-4 w-4 text-primary-foreground" />
            </div>
            <SidebarHeaderTitle>Admin Portal</SidebarHeaderTitle>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-4 py-6 overflow-y-auto max-h-[calc(100vh-130px)]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin")}
                onClick={() => isMobile && setIsSidebarOpen(false)}
              >
                <Link href="/admin">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Content Management - All users can access their own articles */}
            <SidebarSection>
              <SidebarSectionTitle>Content</SidebarSectionTitle>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin/articles")}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <Link href="/admin/articles">
                    <FileText className="h-4 w-4" />
                    <span>Articles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Editors and above can manage categories and tags */}
              {isEditor && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/categories")}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Link href="/admin/categories">
                        <Folder className="h-4 w-4" />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/tags")}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Link href="/admin/tags">
                        <Tag className="h-4 w-4" />
                        <span>Tags</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {/* Admins and owners can manage pages */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/pages")}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                  >
                    <Link href="/admin/pages">
                      <FileQuestion className="h-4 w-4" />
                      <span>Pages</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarSection>

            {/* Communication section - Editors and above */}
            {isEditor && (
              <SidebarSection>
                <SidebarSectionTitle>Communication</SidebarSectionTitle>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/contacts")}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                  >
                    <Link href="/admin/contacts">
                      <MessageSquare className="h-4 w-4" />
                      <span>Contact Messages</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Newsletter access for admins and owners */}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/newsletter")}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Link href="/admin/newsletter">
                        <Mail className="h-4 w-4" />
                        <span>Newsletter</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarSection>
            )}

            {/* Management section - Admins and owners only */}
            {isAdmin && (
              <SidebarSection>
                <SidebarSectionTitle>Management</SidebarSectionTitle>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/authors")}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                  >
                    <Link href="/admin/authors">
                      <Users className="h-4 w-4" />
                      <span>Authors</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/advertisements")}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                  >
                    <Link href="/admin/advertisements">
                      <PanelLeft className="h-4 w-4" />
                      <span>Advertisements</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Analytics - Admins and owners only */}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/navigation")}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Link href="/admin/navigation">
                        <Menu className="h-4 w-4" />
                        <span>Navigation Links</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarSection>
            )}

            {/* Settings section - Different levels based on role */}
            <SidebarSection>
              <SidebarSectionTitle>Account</SidebarSectionTitle>
              {/* All users can access their own settings */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin/user-settings")}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <Link href="/admin/user-settings">
                    <Users className="h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Global site settings - Only for owners */}
              {isOwner && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/settings")}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                  >
                    <Link href="/admin/settings">
                      <Settings className="h-4 w-4" />
                      <span>Site Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin/settings")}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${getRoleBadgeColor()}`}
                      >
                        {userRole}
                      </span>
                    </div>
                    <UserNav />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarSection>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
