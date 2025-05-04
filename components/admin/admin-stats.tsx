"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Tag, FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminStatsProps {
  isLoading: boolean;
  stats: {
    articles: number;
    publishedArticles: number;
    categories: number;
    tags: number;
    users: number;
  };
}

export function AdminStats({ isLoading, stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Articles",
      value: stats?.articles || 0,
      description: `${stats?.publishedArticles || 0} published`,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      link: "/admin/articles",
    },
    {
      title: "Categories",
      value: stats?.categories || 0,
      description: "Total categories",
      icon: <FolderOpen className="h-4 w-4 text-muted-foreground" />,
      link: "/admin/categories",
    },
    {
      title: "Tags",
      value: stats?.tags || 0,
      description: "Total tags",
      icon: <Tag className="h-4 w-4 text-muted-foreground" />,
      link: "/admin/tags",
    },
    {
      title: "Users",
      value: stats?.users || 0,
      description: "Registered users",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      link: "/admin/authors",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{card.value}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
            <Button variant="link" size="sm" className="p-0 mt-2" asChild>
              <Link href={card.link}>View all</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
