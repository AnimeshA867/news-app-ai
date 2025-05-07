import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  change?: number;
  isPositive?: boolean;
  linkText?: string;
  linkHref?: string;
  className?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  change,
  isPositive = true,
  linkText,
  linkHref,
  className,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="flex items-center justify-center">{icon}</div>
          )}
        </div>

        {isLoading ? (
          <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        ) : (
          <div className="text-2xl font-bold">
            {typeof value === "number" ? Number(value).toLocaleString() : value}
          </div>
        )}

        {change !== undefined && (
          <div className="mt-1 flex items-center text-sm">
            <span
              className={cn(
                "mr-1 font-medium",
                isPositive
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500"
              )}
            >
              {isPositive ? "+" : ""}
              {change.toLocaleString()}%
            </span>
            <span className="text-muted-foreground">vs. last period</span>
          </div>
        )}

        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>

      {linkText && linkHref && (
        <CardFooter className="p-0 border-t">
          <Link
            href={linkHref}
            className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <span>{linkText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
