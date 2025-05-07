import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint will run every hour to publish any scheduled articles
export const dynamic = "force-dynamic"; // No caching for cron jobs
export const maxDuration = 300; // Maximum execution time of 5 minutes

export async function GET(req: Request) {
  // Check for cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find articles that should be published
    const articlesToPublish = await prisma.article.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (articlesToPublish.length === 0) {
      return NextResponse.json({ message: "No articles to publish" });
    }

    // Publish the articles
    const publishedArticles = await prisma.article.updateMany({
      where: {
        id: {
          in: articlesToPublish.map((article) => article.id),
        },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      publishedCount: publishedArticles.count,
      message: `Published ${publishedArticles.count} articles`,
    });
  } catch (error) {
    console.error("Error publishing scheduled articles:", error);
    return NextResponse.json(
      { error: "Failed to publish scheduled articles" },
      { status: 500 }
    );
  }
}
