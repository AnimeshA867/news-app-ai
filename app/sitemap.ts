import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Set your actual domain name here
  const domain = "https://newshub-phi.vercel.app";

  try {
    // Collect all URLs for sitemap
    const urls: {
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: number;
    }[] = [];

    // Add static pages
    const staticPages = [
      { url: "", changefreq: "daily", priority: 1.0 },
      { url: "search", changefreq: "weekly", priority: 0.8 },
      { url: "about", changefreq: "monthly", priority: 0.7 },
      { url: "contact", changefreq: "monthly", priority: 0.7 },
      { url: "terms", changefreq: "yearly", priority: 0.4 },
      { url: "privacy", changefreq: "yearly", priority: 0.4 },
    ];

    for (const page of staticPages) {
      urls.push({
        loc: `${domain}/${page.url}`,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      });
    }

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
      urls.push({
        loc: `${domain}/article/${article.slug}`,
        lastmod: article.updatedAt.toISOString(),
        changefreq: "monthly",
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
      urls.push({
        loc: `${domain}/category/${category.slug}`,
        lastmod: category.updatedAt.toISOString(),
        changefreq: "weekly",
        priority: 0.9,
      });
    }

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

    // Return XML with correct content type
    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
