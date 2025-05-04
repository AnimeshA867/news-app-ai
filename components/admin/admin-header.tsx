"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Plus } from "lucide-react";
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

type NewActionConfig = {
  path: string;
  label: string;
  href: string;
};

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

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
      <div className="flex items-center gap-4">
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
      </div>
      <div className="ml-auto flex items-center gap-2">
        {currentAction && (
          <Button variant="outline" size="sm" asChild>
            <Link href={currentAction.href}>
              <Plus className="mr-1 h-4 w-4" /> {currentAction.label}
            </Link>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary"></span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              New comment on "Global Climate Summit"
            </DropdownMenuItem>
            <DropdownMenuItem>
              New user registration: john.doe@example.com
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </div>
    </header>
  );
}
