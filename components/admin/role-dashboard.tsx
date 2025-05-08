"use client";

import { useSession } from "next-auth/react";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminRecentArticles } from "@/components/admin/admin-recent-articles";
import { AdminOverview } from "@/components/admin/admin-overview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Lightbulb, TrendingUp } from "lucide-react";
import React from "react";

interface RoleDashboardProps {
  stats: any;
  isLoading: boolean;
}

export function RoleDashboard({ stats, isLoading }: RoleDashboardProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "AUTHOR";

  return (
    <>
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

      {/* Role-specific welcome message */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-medium">
          Welcome, {session?.user?.name}
        </AlertTitle>
        <AlertDescription>
          {userRole === "OWNER" &&
            "As an Owner, you have full access to all areas of the admin dashboard."}
          {userRole === "ADMIN" &&
            "As an Admin, you can manage most aspects of the site except for critical system settings."}
          {userRole === "EDITOR" &&
            "As an Editor, you can manage content and approve author submissions."}
          {userRole === "AUTHOR" &&
            "As an Author, you can create and manage your own articles."}
        </AlertDescription>
      </Alert>

      {/* Role-specific content tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>

          <TabsTrigger value="articles">My Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 w-full animate-pulse rounded-md bg-muted"
                      />
                    ))}
                  </div>
                ) : (
                  <div>
                    {/* Recent activity content */}
                    {stats?.recentActivity?.length > 0 ? (
                      stats.recentActivity.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="mb-2 flex items-center justify-between border-b pb-2"
                        >
                          <div className="flex items-center">
                            <span className="mr-2 truncate font-medium">
                              {item.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {item.action}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p>No recent activity to display</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Tips & Resources</CardTitle>
                <CardDescription>
                  Helpful information for your role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRole === "OWNER" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Review Site Settings</p>
                          <p className="text-muted-foreground">
                            Make sure to configure your site settings including
                            SMTP for newsletters.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Regular Backups</p>
                          <p className="text-muted-foreground">
                            Ensure your database is backed up regularly to
                            prevent data loss.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {userRole === "ADMIN" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">User Management</p>
                          <p className="text-muted-foreground">
                            Review pending user accounts and assign appropriate
                            roles.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Content Review</p>
                          <p className="text-muted-foreground">
                            Monitor recently published articles for quality and
                            compliance.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {userRole === "EDITOR" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Content Calendar</p>
                          <p className="text-muted-foreground">
                            Check the publishing schedule and ensure content is
                            evenly distributed.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Author Support</p>
                          <p className="text-muted-foreground">
                            Review pending articles from authors and provide
                            constructive feedback.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {userRole === "AUTHOR" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Content Guidelines</p>
                          <p className="text-muted-foreground">
                            Familiarize yourself with our content guidelines
                            before submitting articles.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                        <div className="text-sm">
                          <p className="font-medium">Draft Articles</p>
                          <p className="text-muted-foreground">
                            You can save drafts and return to finish them later
                            before submitting.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="articles">
          <AdminRecentArticles />
        </TabsContent>
      </Tabs>
    </>
  );
}
