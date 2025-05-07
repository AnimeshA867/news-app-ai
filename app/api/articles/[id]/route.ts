import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { id } = await params;

    // Get the existing article to check for status changes
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Determine if we need to update publishedAt
    let publishedAt = existingArticle.publishedAt;

    // If changing status to PUBLISHED from another status
    if (data.status === "PUBLISHED" && existingArticle.status !== "PUBLISHED") {
      publishedAt = new Date();
    }

    const jsonLdData = data.structuredData || null;

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        status: data.status,
        featuredImage: data.featuredImage,
        featuredImageAlt: data.featuredImageAlt || null,
        publishedAt: publishedAt,
        scheduledAt: data.status === "SCHEDULED" ? data.scheduledAt : null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        noIndex: data.noIndex || false,
        structuredData: data.structuredData || null,
        jsonLd: jsonLdData,
        category: data.categoryId
          ? {
              connect: {
                id: data.categoryId,
              },
            }
          : undefined,
        tags: {
          set: [], // Clear existing connections
          connect: data.tagIds ? data.tagIds.map((id: string) => ({ id })) : [],
        },
      },
      include: {
        author: true,
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    const { id } = await params;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
