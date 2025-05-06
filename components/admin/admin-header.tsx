"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Plus, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";

type NewActionConfig = {
  path: string;
  label: string;
  href: string;
};

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { data: session } = useSession();

  // Configuration for "New" button based on current route
  const newActions: NewActionConfig[] = [
    {
      path: "/admin/articles",
      label: "New Article",
      href: "/admin/articles/new/edit",
    },
    {
      path: "/admin/categories",
      label: "New Category",
      href: "/admin/categories/new",
    },
    { path: "/admin/tags", label: "New Tag", href: "/admin/tags/new" },
    { path: "/admin/authors", label: "New Author", href: "/admin/authors/new" },
  ];

  // Find the action for the current path
  const currentAction = newActions.find((action) =>
    pathname?.startsWith(action.path)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6 mx-auto container">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger />
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          {currentAction && (
            <Button asChild>
              <Link href={currentAction.href}>
                <Plus className="mr-2 h-4 w-4" />
                {currentAction.label}
              </Link>
            </Button>
          )}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback>
                      {session.user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/user-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
