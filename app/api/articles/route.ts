import { type NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const breaking = searchParams.get("breaking") === "true";
    const featured = searchParams.get("featured") === "true";

    // Build where conditions
    const where: any = { status: "PUBLISHED" };

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

    if (breaking) {
      where.isBreakingNews = true;
    }

    if (featured) {
      where.isFeatured = true;
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
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Create the article
    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        status: data.status,
        author: {
          connect: { id: session.user.id },
        },
        category: {
          connect: { id: data.categoryId },
        },
        ...(data.tagIds?.length > 0
          ? {
              tags: {
                connect: data.tagIds.map((id: string) => ({ id })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
