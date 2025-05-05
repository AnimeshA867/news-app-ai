"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminRecentArticles } from "@/components/admin/admin-recent-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { setStats } from "@/store/statsSlice";

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const stats = useSelector((state) => state.stats.stats);
  const isLoading = useSelector((state) => state.stats.isLoading);

  const fetchStats = async () => {
    dispatch(setStats({ isLoading: true }));
    try {
      const response = await fetch("/api/admin/stats");
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
  };

  useEffect(() => {
    fetchStats();
  }, [dispatch, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
                {stats?.recentActivity.slice(0, 5).map((user) => (
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
                ))}
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
                  {stats?.articleStatusCounts.map((statusCount) => (
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
                  ))}
                </div>
                <div className="space-y-2">
                  {stats?.categoryStats.slice(0, 5).map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between"
                    >
                      <div>{category.name}</div>
                      <div className="text-sm font-medium">
                        {category.count} articles
                      </div>
                    </div>
                  ))}
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
