import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the current advertisement
    const ad = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Toggle the status
    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: {
        isActive: !ad.isActive,
      },
    });

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Error toggling advertisement status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
