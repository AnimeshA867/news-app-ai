"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Sidebar container
const Sidebar = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-screen flex-col border-r bg-background", className)}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

// Sidebar header
const SidebarHeader = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-14 items-center px-4", className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = "SidebarHeader";

// Sidebar header title
const SidebarHeaderTitle = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
);
SidebarHeaderTitle.displayName = "SidebarHeaderTitle";

// Sidebar content
const SidebarContent = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto", className)}
      {...props}
    />
  )
);
SidebarContent.displayName = "SidebarContent";

// Sidebar footer
const SidebarFooter = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  )
);
SidebarFooter.displayName = "SidebarFooter";

// Sidebar section
const SidebarSection = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("py-2", className)} {...props} />
  )
);
SidebarSection.displayName = "SidebarSection";

// Sidebar section title
const SidebarSectionTitle = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        "mb-2 px-2 text-sm font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  )
);
SidebarSectionTitle.displayName = "SidebarSectionTitle";

// Sidebar menu
const SidebarMenu = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

// Sidebar menu item
const SidebarMenuItem = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

// Sidebar menu button
interface SidebarMenuButtonProps {
  isActive?: boolean;
  asChild?: boolean;
  [key: string]: any;
}

const SidebarMenuButton = React.forwardRef<any, SidebarMenuButtonProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    const childProps = asChild ? (props.children as any).props : {};

    const combinedProps = {
      ...props,
      ...childProps,
      ref,
      className: cn(
        "flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      ),
    };

    if (asChild) {
      return React.cloneElement(props.children as any, combinedProps);
    }

    return <Comp {...combinedProps} />;
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarContent,
  SidebarFooter,
  SidebarSection,
  SidebarSectionTitle,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};
