import { prisma } from "@/lib/prisma";
import { cache } from "react";

// Define a clear interface for our articles

// Single fetch function that gets all articles with necessary data
export const fetchAllArticles = cache(async () => {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
    ],
    take: 10, // Fetch a reasonable amount for homepage needs
  });

  return articles as Article[];
});

const allArticles = await fetchAllArticles();

// Use in-memory filtering instead of separate database calls
export const fetchFeaturedArticles = cache(async () => {
  // const allArticles = await fetchAllArticles();
  return allArticles.filter((article) => article.isFeatured).slice(0, 5);
});

export const fetchTrendingArticles = cache(async () => {
  // const allArticles = await fetchAllArticles();
  return [...allArticles]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 6);
});

export const fetchTopHeadlines = cache(async () => {
  // const allArticles = await fetchAllArticles();
  return allArticles
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 7);
});

export const fetchBreakingNews = cache(async () => {
  // const allArticles = await fetchAllArticles();
  return allArticles
    .filter((article) => article.isBreakingNews)
    .slice(0, 5)
    .map((article) => ({
      slug: article.slug,
      title: article.title,
    }));
});

export const getCategoryArticles = cache(
  async (category: string, limit: number) => {
    // const allArticles = await fetchAllArticles();

    // Filter articles by category slug
    const categoryArticles = allArticles
      .filter((article) => article.category?.slug === category)
      .slice(0, limit);

    // Get the category details from any article
    const categoryDetails =
      categoryArticles.length > 0 ? categoryArticles[0].category : null;

    // If we found enough articles, return the filtered result
    if (categoryArticles.length > 0) {
      return {
        ...categoryDetails,
        articles: categoryArticles,
      };
    }

    // If no articles found or not enough, then make a direct query
    // This is a fallback in case our initial fetch didn't include
    // articles from this category
    return await prisma.category.findUnique({
      where: { slug: category },
      include: {
        articles: {
          where: { status: "PUBLISHED" },
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            category: true,
          },
          orderBy: { publishedAt: "desc" },
        },
      },
    });
  }
);

// Combine all data needs for homepage into a single function
export const getHomePageData = cache(async () => {
  // const allArticles = await fetchAllArticles();

  const featuredArticles = allArticles
    .filter((article) => article.isFeatured)
    .slice(0, 5);

  const trendingArticles = [...allArticles]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 6);

  const topHeadlines = allArticles.slice(0, 7).map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    publishedAt: article.publishedAt,
    category: article.category
      ? {
          name: article.category.name,
        }
      : null,
  }));

  const breakingNews = allArticles
    .filter((article) => article.isBreakingNews)
    .slice(0, 5)
    .map((article) => ({
      slug: article.slug,
      title: article.title,
    }));

  return {
    featuredArticles,
    trendingArticles,
    topHeadlines,
    breakingNews,
    allArticles: allArticles.slice(0, 10), // Just in case you need a subset
  };
});

// Categories don't need to be filtered from articles
export const getCategories = cache(async () => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return categories;
});
