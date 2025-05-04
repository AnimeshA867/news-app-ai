import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { unlink } from "fs/promises";
import { existsSync } from "fs";

// DELETE media
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the media item
    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete the file from disk
    const filePath = path.join(process.cwd(), "public", media.url);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // Delete record from database
    await prisma.media.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
