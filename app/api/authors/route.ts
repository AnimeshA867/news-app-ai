import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcryptjs";
export async function GET(req: Request) {
  try {
    const authors = await prisma.user.findMany({
      where: {
        role: {
          in: ["AUTHOR", "ADMIN"],
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !["ADMIN", "OWNER"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const hashedPassword = await hash(data.password, 10);
    // Create the user first
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        password: hashedPassword, // Ensure this is hashed in a real application
        image: data.image,
        // Create the author profile with the same transaction
      },
    });

    return NextResponse.json({ author: user });
  } catch (error) {
    console.error("Error creating author:", error);
    return NextResponse.json(
      { error: "Failed to create author" },
      { status: 500 }
    );
  }
}
