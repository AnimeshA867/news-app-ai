import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const link = await prisma.navigationLink.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error fetching navigation link:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation link" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin or owner to modify navigation
    if (
      !session?.user ||
      !["ADMIN", "OWNER"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();
    const { name, href, group, order, isEnabled } = body;

    const updatedData: Record<string, any> = {};
    if (name !== undefined) updatedData.name = name;
    if (href !== undefined) updatedData.href = href;
    if (group !== undefined) updatedData.group = group;
    if (order !== undefined) updatedData.order = order;
    if (isEnabled !== undefined) updatedData.isEnabled = isEnabled;

    const link = await prisma.navigationLink.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error updating navigation link:", error);
    return NextResponse.json(
      { error: "Failed to update navigation link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin or owner to modify navigation
    if (
      !session?.user ||
      !["ADMIN", "OWNER"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    await prisma.navigationLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting navigation link:", error);
    return NextResponse.json(
      { error: "Failed to delete navigation link" },
      { status: 500 }
    );
  }
}
