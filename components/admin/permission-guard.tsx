"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";

type Role = "AUTHOR" | "EDITOR" | "ADMIN" | "OWNER";

interface PermissionGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallbackUrl?: string;
}

export function PermissionGuard({
  children,
  allowedRoles,
  fallbackUrl = "/admin",
}: PermissionGuardProps) {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  useEffect(() => {
    // If authentication is complete and user doesn't have permission
    if (
      status === "authenticated" &&
      userRole &&
      !allowedRoles.includes(userRole)
    ) {
      redirect(fallbackUrl);
    }
  }, [status, userRole, allowedRoles, fallbackUrl]);

  // Still loading
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    redirect("/admin/login");
    return null;
  }

  // Authenticated but checking permissions
  if (!userRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user has permission
  if (!allowedRoles.includes(userRole)) {
    redirect(fallbackUrl);
    return null;
  }

  // User has permission
  return <>{children}</>;
}
