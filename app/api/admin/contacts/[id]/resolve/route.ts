import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin or owner role
    if (
      !session?.user ||
      !["ADMIN", "OWNER", "EDITOR"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { isResolved } = body;

    const contact = await prisma.contact.update({
      where: { id },
      data: { isResolved },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error updating contact resolution status:", error);
    return NextResponse.json(
      { error: "Failed to update contact resolution status" },
      { status: 500 }
    );
  }
}
