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

    if (
      !session?.user ||
      !["ADMIN", "OWNER", "EDITOR"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { notes } = body;

    const contact = await prisma.contact.update({
      where: { id },
      data: { notes },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error updating contact notes:", error);
    return NextResponse.json(
      { error: "Failed to update contact notes" },
      { status: 500 }
    );
  }
}
