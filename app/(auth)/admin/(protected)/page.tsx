"use client";

import { useEffect, useCallback } from "react";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminRecentArticles } from "@/components/admin/admin-recent-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setStats } from "@/lib/redux/store/statsSlice";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { stats, isLoading } = useAppSelector((state) => state.stats);

  const fetchStats = useCallback(async () => {
    dispatch(setStats({ isLoading: true }));
    try {
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      dispatch(setStats({ stats: data }));
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      dispatch(setStats({ isLoading: false }));
    }
  }, [dispatch, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6 container">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Refresh
        </button>
      </div>

      <AdminStats
        isLoading={isLoading}
        stats={
          stats?.counts || {
            articles: 0,
            publishedArticles: 0,
            categories: 0,
            tags: 0,
            users: 0,
          }
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentActivity?.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge>{user.role}</Badge>
                  </div>
                )) || <p>No recent activity found</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Article Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {stats?.articleStatusCounts?.map((statusCount) => (
                    <Card key={statusCount.status}>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {statusCount.count}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {statusCount.status}
                        </p>
                      </CardContent>
                    </Card>
                  )) || <p>No article status data available</p>}
                </div>
                <div className="space-y-2">
                  {stats?.categoryStats?.slice(0, 5).map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between"
                    >
                      <div>{category.name}</div>
                      <div className="text-sm font-medium">
                        {category.count} articles
                      </div>
                    </div>
                  )) || <p>No category stats available</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminRecentArticles />
    </div>
  );
}
