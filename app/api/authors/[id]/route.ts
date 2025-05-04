import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

// GET single author
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const author = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json(author);
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json(
      { error: "Failed to fetch author" },
      { status: 500 }
    );
  }
}

// PUT (update) author
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (
      !session?.user ||
      (session.user.role !== "ADMIN" && session.user.id !== params.id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role, image, bio } = await req.json();

    // Only admins can change roles
    if (role && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized to change role" },
        { status: 403 }
      );
    }

    // Check if email is already taken by a different user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: params.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && session.user.role === "ADMIN") updateData.role = role;
    if (image) updateData.image = image;
    if (bio !== undefined) updateData.bio = bio;

    // Handle password update if provided
    if (password) {
      updateData.password = await hash(password, 12);
    }

    const author = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json(author);
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json(
      { error: "Failed to update author" },
      { status: 500 }
    );
  }
}

// DELETE author
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if author has articles
    const authorWithArticles = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (
      authorWithArticles?._count.articles &&
      authorWithArticles._count.articles > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete author with articles. Reassign or delete their articles first.",
        },
        { status: 400 }
      );
    }

    // Prevent deleting the last admin
    if (params.id === session.user.id) {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json(
      { error: "Failed to delete author" },
      { status: 500 }
    );
  }
}
