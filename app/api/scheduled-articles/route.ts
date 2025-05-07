import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint will be called by the cron job to publish scheduled articles
export async function GET() {
  try {
    // Find all scheduled articles that should be published now
    const now = new Date();

    const scheduledArticles = await prisma.article.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
    });

    // Publish each scheduled article
    const updatePromises = scheduledArticles.map((article) =>
      prisma.article.update({
        where: {
          id: article.id,
        },
        data: {
          status: "PUBLISHED",
          publishedAt: now,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      publishedCount: scheduledArticles.length,
      articles: scheduledArticles.map((a) => a.title),
    });
  } catch (error) {
    console.error("Error publishing scheduled articles:", error);
    return NextResponse.json(
      { error: "Failed to publish scheduled articles" },
      { status: 500 }
    );
  }
}
