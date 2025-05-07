import { prisma } from "@/lib/prisma";

interface DashboardStats {
  articlesCount: number;
  draftCount: number;
  scheduledCount: number;
  viewsCount: number;
  usersCount: number;
  categoriesCount: number;
  tagsCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get published articles count
  const articlesCount = await prisma.article.count({
    where: {
      status: "PUBLISHED",
    },
  });

  // Get draft articles count
  const draftCount = await prisma.article.count({
    where: {
      status: "DRAFT",
    },
  });

  // Get scheduled articles count
  const scheduledCount = await prisma.article.count({
    where: {
      status: "SCHEDULED",
    },
  });

  // Get total views count
  const viewsResult = await prisma.article.aggregate({
    _sum: {
      viewCount: true,
    },
  });
  const viewsCount = viewsResult._sum.viewCount || 0;

  // Get comments count if you have a comments table
  // If not, set to 0 or remove this metric

  // Get users count
  const usersCount = await prisma.user.count();

  // Get categories count
  const categoriesCount = await prisma.category.count();

  // Get tags count
  const tagsCount = await prisma.tag.count();

  return {
    articlesCount,
    draftCount,
    scheduledCount,
    viewsCount,
    usersCount,
    categoriesCount,
    tagsCount,
  };
}
