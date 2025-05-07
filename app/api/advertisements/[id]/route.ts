import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const ad = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        zones: true,
        pages: true,
      },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
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

    // Update the advertisement
    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: {
        ...adData,

        // Update zones - using set to replace existing connections
        zones: {
          set: zones?.map((zoneId: string) => ({ id: zoneId })) || [],
        },

        // Replace pages - delete existing and create new
        pages: {
          deleteMany: {},
          createMany: {
            data: pagesData,
          },
        },
      },
      include: {
        zones: true,
        pages: true,
      },
    });

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Delete the advertisement
    await prisma.advertisement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
