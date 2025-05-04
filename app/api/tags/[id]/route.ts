import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single tag
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error fetching tag:", error);
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

// PUT (update) tag
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug } = await req.json();

    // Check if slug is already taken by a different tag
    if (slug) {
      const existingTag = await prisma.tag.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      });

      if (existingTag) {
        return NextResponse.json(
          { error: "A tag with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}

// DELETE tag
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, disconnect tag from all articles
    await prisma.article.update({
      where: {
        id,
      },
      data: {
        tags: {
          disconnect: { id: params.id },
        },
      },
    });

    await prisma.tag.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}
