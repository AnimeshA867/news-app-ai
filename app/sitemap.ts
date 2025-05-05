import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Set your actual domain name here
  const domain = "https://newshub-phi.vercel.app";

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
    url: `${domain}/${page.url}`,
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
        url: `${domain}/article/${article.slug}`,
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
        url: `${domain}/category/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    return routes;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return routes; // Return static routes if dynamic ones fail
  }
}
