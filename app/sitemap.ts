import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://news.manasukh.com";

  // Get all published pages
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  // Generate sitemap entries for static pages
  const pageEntries = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
  }));

  // Define static pages
  const staticPages = [
    { url: "", changeFrequency: "daily", priority: 1.0 },
    { url: "search", changeFrequency: "weekly", priority: 0.8 },
    { url: "about", changeFrequency: "monthly", priority: 0.7 },
    { url: "contact", changeFrequency: "monthly", priority: 0.7 },
    { url: "terms", changeFrequency: "yearly", priority: 0.4 },
    { url: "privacy", changeFrequency: "yearly", priority: 0.4 },
  ];

  // Initialize sitemap entries with static pages
  const routes: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}/${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency as
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly",
    priority: page.priority,
  }));

  try {
    // Get all published articles
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    // Add article URLs
    for (const article of articles) {
      routes.push({
        url: `${baseUrl}/article/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Add category URLs
    for (const category of categories) {
      routes.push({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    // Add page entries
    routes.push(...pageEntries);

    return routes;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return routes; // Return static routes if dynamic ones fail
  }
}
