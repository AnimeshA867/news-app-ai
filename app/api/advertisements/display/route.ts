import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const pageType = searchParams.get("pageType") || "global";
    const pageId = searchParams.get("pageId");

    if (!position) {
      return NextResponse.json(
        { error: "Position parameter is required" },
        { status: 400 }
      );
    }

    // Get current date
    const now = new Date();

    // Find appropriate ad for this position and page
    const ads = await prisma.advertisement.findMany({
      where: {
        position,
        // Only active ads
        isActive: true,
        // Current date is after start date
        startDate: { lte: now },
        // Current date is before end date (if one exists)
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        // Match page type/ID if provided
        ...(pageType !== "global"
          ? {
              pages: {
                some: {
                  OR: [
                    // Exact page match
                    pageId ? { pageType, pageIdentifier: pageId } : {},
                    // Page type match without specific ID
                    { pageType, pageIdentifier: null },
                    // Global pages (apply everywhere)
                    { pageType: "global" },
                  ],
                },
              },
            }
          : {}),
      },
      // Higher priority and recently created ads first
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 1,
    });

    if (ads.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(ads[0]);
  } catch (error) {
    console.error("Error serving advertisement:", error);
    return NextResponse.json(
      { error: "Failed to serve advertisement" },
      { status: 500 }
    );
  }
}
