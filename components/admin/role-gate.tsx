"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = session?.user?.role || "";
  const isAllowed = allowedRoles.includes(userRole);

  useEffect(() => {
    // If authentication is complete and user isn't allowed, redirect
    if (status === "authenticated" && !isAllowed) {
      // Only redirect if no fallback is provided
      if (!fallback) {
        router.push("/admin");
      }
    }
  }, [status, isAllowed, router, fallback]);

  // Show loading when checking auth
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If not allowed and fallback provided
  if (!isAllowed && fallback) {
    return <>{fallback}</>;
  }

  // If allowed or we haven't redirected yet
  return isAllowed ? <>{children}</> : null;
}
