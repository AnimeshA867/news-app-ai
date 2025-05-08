"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Permissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageContent: boolean;
  canPublishContent: boolean;
  canCreateContent: boolean;
  canManageSelf: boolean;
  role: string;
  isLoading: boolean;
  error: string | null;
}

const defaultPermissions: Permissions = {
  canManageUsers: false,
  canManageSettings: false,
  canManageContent: false,
  canPublishContent: false,
  canCreateContent: false,
  canManageSelf: true,
  role: "AUTHOR",
  isLoading: true,
  error: null,
};

export function usePermissions(): Permissions {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] =
    useState<Permissions>(defaultPermissions);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      setPermissions({
        ...defaultPermissions,
        isLoading: false,
        error: "Not authenticated",
      });
      return;
    }

    async function fetchPermissions() {
      try {
        const response = await fetch("/api/auth/permissions");

        if (!response.ok) {
          throw new Error("Failed to fetch permissions");
        }

        const data = await response.json();

        setPermissions({
          ...data.permissions,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setPermissions({
          ...defaultPermissions,
          isLoading: false,
          error: (error as Error).message,
        });
      }
    }

    fetchPermissions();
  }, [status, session]);

  return permissions;
}
