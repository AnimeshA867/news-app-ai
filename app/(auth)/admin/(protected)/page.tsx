import { Suspense } from "react";
import { StatsGrid } from "@/components/admin/stats-grid";
import { getDashboardStats } from "@/lib/dashboard-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminRecentArticles } from "@/components/admin/admin-recent-articles";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your site's performance and content
        </p>
      </div>

      <Suspense fallback={<StatsGrid stats={{} as any} isLoading={true} />}>
        <StatsGrid stats={stats} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>
              The latest articles published on your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="animate-pulse h-64 bg-muted rounded-md" />
              }
            >
              <AdminRecentArticles />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
