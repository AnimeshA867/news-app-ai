import { type NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const author = searchParams.get("author") || "";
    const status = searchParams.get("status");

    // Build where conditions
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    if (author) {
      where.author = {
        id: author,
      };
    }

    // Get total count
    const totalCount = await prisma.article.count({ where });

    // Get articles
    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      articles,
      meta: {
        total: totalCount,
        pages: totalPages,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = await req.json();

    // Set publishedAt based on status
    let publishedAt: Date | null = null;
    if (data.status === "PUBLISHED") {
      publishedAt = new Date();
    }

    const jsonLdData = data.structuredData || null;

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title),
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || "",
        status: data.status,
        publishedAt: publishedAt,
        scheduledAt: data.status === "SCHEDULED" ? data.scheduledAt : null,
        author: {
          connect: { id: user.id }, // Connect to the authenticated user
        },
        category: {
          connect: { id: data.categoryId },
        },
        tags: data.tagIds?.length
          ? {
              connect: data.tagIds.map((id: string) => ({ id })),
            }
          : undefined,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        noIndex: data.noIndex || false,
        structuredData: data.structuredData || null,
        jsonLd: jsonLdData,
      },
      include: {
        author: true,
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
