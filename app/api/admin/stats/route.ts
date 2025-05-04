import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total counts
    const articlesCount = await prisma.article.count();
    const publishedArticlesCount = await prisma.article.count({
      where: { status: "PUBLISHED" },
    });
    const draftsCount = await prisma.article.count({
      where: { status: "DRAFT" },
    });
    const categoriesCount = await prisma.category.count();
    const tagsCount = await prisma.tag.count();
    const usersCount = await prisma.user.count();

    // Get recent articles
    const recentArticles = await prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Get articles per category
    const categoriesWithCount = await prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const categoryStats = categoriesWithCount.map((category) => ({
      name: category.name,
      count: category._count.articles,
    }));

    // Get articles by status
    const articleStatusCounts = [
      { status: "Published", count: publishedArticlesCount },
      { status: "Draft", count: draftsCount },
      {
        status: "Scheduled",
        count: await prisma.article.count({ where: { status: "SCHEDULED" } }),
      },
    ];

    // Get recent user activity
    const recentActivity = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        role: true,
      },
    });

    return NextResponse.json({
      counts: {
        articles: articlesCount,
        publishedArticles: publishedArticlesCount,
        drafts: draftsCount,
        categories: categoriesCount,
        tags: tagsCount,
        users: usersCount,
      },
      recentArticles,
      categoryStats,
      articleStatusCounts,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
