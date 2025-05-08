import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const group = url.searchParams.get("group");

    const where = group ? { group, isEnabled: true } : { isEnabled: true };

    const links = await prisma.navigationLink.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        href: true,
        group: true,
        order: true,
      },
    });

    // Group links by their group property
    const groupedLinks = links.reduce(
      (acc, link) => {
        if (!acc[link.group]) {
          acc[link.group] = [];
        }
        acc[link.group].push(link);
        return acc;
      },
      {} as Record<string, typeof links>
    );

    return NextResponse.json({ links: groupedLinks });
  } catch (error) {
    console.error("Error fetching navigation links:", error);
    return NextResponse.json(
      { error: "Failed to fetch navigation links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin or owner to modify navigation
    if (
      !session?.user ||
      !["ADMIN", "OWNER"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, href, group, order, isEnabled = true } = body;

    if (!name || !href || !group) {
      return NextResponse.json(
        { error: "Name, href and group are required" },
        { status: 400 }
      );
    }

    const link = await prisma.navigationLink.create({
      data: {
        name,
        href,
        group,
        order: order || 0,
        isEnabled,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error creating navigation link:", error);
    return NextResponse.json(
      { error: "Failed to create navigation link" },
      { status: 500 }
    );
  }
}
