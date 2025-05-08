import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and permission
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: {
        sentAt: "desc",
      },
    });

    return NextResponse.json({ newsletters });
  } catch (error) {
    console.error("Error fetching newsletter history:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter history" },
      { status: 500 }
    );
  }
}
