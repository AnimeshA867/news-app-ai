import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if user exists and get full permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Define permissions based on role
    const permissions = {
      canManageUsers: ["OWNER", "ADMIN"].includes(user.role),
      canManageSettings: ["OWNER"].includes(user.role),
      canManageContent: ["OWNER", "ADMIN", "EDITOR"].includes(user.role),
      canPublishContent: ["OWNER", "ADMIN", "EDITOR"].includes(user.role),
      canCreateContent: ["OWNER", "ADMIN", "EDITOR", "AUTHOR"].includes(
        user.role
      ),
      canManageSelf: true, // All users can manage themselves
      role: user.role,
    };

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Error checking permissions:", error);
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 }
    );
  }
}
