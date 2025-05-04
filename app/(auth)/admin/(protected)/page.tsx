"use client";

import { useState, useEffect } from "react";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminRecentArticles } from "@/components/admin/admin-recent-articles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

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
