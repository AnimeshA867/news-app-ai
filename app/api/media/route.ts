import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// GET all media
export async function GET(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST new media (upload files)
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded" },
        { status: 400 }
      );
    }

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        // Generate a unique filename
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 12);
        const fileName = `${timestamp}-${randomString}-${file.name.replace(
          /\s+/g,
          "-"
        )}`;

        // Create file path
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());

        // Write file to disk
        await writeFile(filePath, buffer);

        // Save to database
        const media = await prisma.media.create({
          data: {
            name: file.name,
            url: `/uploads/${fileName}`,
            type: file.type,
            size: file.size,
          },
        });

        return media;
      })
    );

    return NextResponse.json(uploadResults, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
