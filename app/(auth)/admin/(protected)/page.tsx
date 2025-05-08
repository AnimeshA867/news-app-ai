import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton";
import { RoleDashboard } from "@/components/admin/role-dashboard";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for management of the news site",
};

interface Stats {
  counts: {
    articles: number;
    publishedArticles: number;
    categories: number;
    tags: number;
    users: number;
  };
  recentActivity: { id: string; name: string; email: string; role: string }[];
  articleStatusCounts: { status: string; count: number }[];
  categoryStats: { name: string; count: number }[];
}

async function getStats() {
  const [
    articlesCount,
    publishedArticlesCount,
    categoriesCount,
    tagsCount,
    usersCount,
    recentUsers,
    articleStatusData,
    categoryData,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.article.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    }),
  ]);

  const articleStatusCounts = articleStatusData.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));

  const categoryStats = categoryData
    .map((category) => ({
      name: category.name,
      count: category._count.articles,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    counts: {
      articles: articlesCount,
      publishedArticles: publishedArticlesCount,
      categories: categoriesCount,
      tags: tagsCount,
      users: usersCount,
    },
    recentActivity: recentUsers,
    articleStatusCounts,
    categoryStats,
  } as Stats;
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <RoleDashboard stats={stats} isLoading={false} />
      </Suspense>
    </div>
  );
}
