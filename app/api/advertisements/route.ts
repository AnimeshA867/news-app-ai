import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET all advertisements
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const position = searchParams.get("position") || undefined;
    const zoneId = searchParams.get("zone") || undefined;
    const active = searchParams.get("active");

    // Build filters
    const filters: any = {
      OR: query
        ? [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
      position: position,
      isActive: active ? active === "true" : undefined,
      zones: zoneId ? { some: { id: zoneId } } : undefined,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key]
    );

    const ads = await prisma.advertisement.findMany({
      where: filters,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        zones: true,
      },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new advertisement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Extract fields that need special handling
    const {
      zones = [],
      pageTypes = [],
      pageIdentifiers = [],
      ...adData
    } = body;

    // Filter out any pageTypes that are empty strings
    const validPageTypes = pageTypes.filter(
      (type: string) => type.trim() !== ""
    );

    // Create pages data for valid page types
    const pagesData = validPageTypes.map((pageType: string, index: number) => ({
      pageType,
      pageIdentifier: pageIdentifiers?.[index] || null,
    }));

    const newAd = await prisma.advertisement.create({
      data: {
        ...adData,
        // Initialize counts
        impressions: 0,
        clicks: 0,

        // Connect zones by ID
        zones: {
          connect: zones?.map((zoneId: string) => ({ id: zoneId })) || [],
        },

        // Create pages
        pages: {
          create: pagesData,
        },
      },
      include: {
        zones: true,
        pages: true,
      },
    });

    return NextResponse.json(newAd, { status: 201 });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
