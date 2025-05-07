import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const position = url.searchParams.get("position");
    const pageType = url.searchParams.get("pageType") || "global";
    const pageId = url.searchParams.get("pageId");
    const index = parseInt(url.searchParams.get("index") || "0", 10);

    if (!position) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    // Base query conditions
    const conditions: any = {
      position,
      isActive: true,
      startDate: { lte: new Date() },
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    };

    // Page targeting
    const pageTargetingConditions = [
      // For ads targeting all pages (no targeting)
      {
        pages: {
          none: {},
        },
      },
      // For ads with specific targeting
      {
        pages: {
          some: {
            pageType,
            // If pageId is provided, match it or match ads targeting all pages of this type (null pageIdentifier)
            ...(pageId
              ? {
                  OR: [{ pageIdentifier: pageId }, { pageIdentifier: null }],
                }
              : { pageIdentifier: null }),
          },
        },
      },
    ];

    conditions.OR = pageTargetingConditions;

    // Find all matching ads, ordered by priority
    const ads = await prisma.advertisement.findMany({
      where: conditions,
      orderBy: [
        { priority: "desc" },
        { impressions: "asc" }, // Show less-viewed ads first as secondary sort
      ],
      include: {
        pages: true,
      },
    });

    // If no ads found
    if (!ads.length) {
      return NextResponse.json(null, { status: 404 });
    }

    // Get the specified ad by index, or default to first if index is out of bounds
    const ad = ads.length > index ? ads[index] : ads[0];

    // Update impression count
    await prisma.advertisement.update({
      where: { id: ad.id },
      data: {
        impressions: { increment: 1 },
      },
    });

    // Remove pages data from response to keep it clean
    const { pages, ...adWithoutPages } = ad;

    return NextResponse.json(adWithoutPages);
  } catch (error) {
    console.error("Error serving advertisement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
