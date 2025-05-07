import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { type } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing advertisement ID" },
        { status: 400 }
      );
    }

    if (type === "impression") {
      await prisma.advertisement.update({
        where: { id },
        data: { impressions: { increment: 1 } },
      });
    } else if (type === "click") {
      await prisma.advertisement.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid tracking type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking ad:", error);
    return NextResponse.json(
      { error: "Failed to track advertisement" },
      { status: 500 }
    );
  }
}
