import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface AccessDeniedProps {
  message?: string;
  showBackLink?: boolean;
}

export function AccessDenied({
  message = "You don't have permission to access this page",
  showBackLink = true,
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
      <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {showBackLink && (
        <Button asChild>
          <Link href="/admin">Return to Dashboard</Link>
        </Button>
      )}
    </div>
  );
}
