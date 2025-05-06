import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET settings
export async function GET() {
  try {
    const settings = await prisma.setting.findFirst();

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.setting.create({
        data: {
          siteName: "News AI",
          tagline: "AI-Powered News Platform",
          description: "The latest news and stories from around the world",
          logoUrl: "/logo.svg",
          faviconUrl: "/favicon.ico",
          senderEmail: "news@example.com",
          senderName: "News AI",
          enableNewsletter: true,
          enableSearch: true,
          enableSocialSharing: true,
          enableRelatedArticles: true,
        },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT (update) settings
export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Get existing settings or create default
    const existingSettings = await prisma.setting.findFirst();

    const settings = existingSettings
      ? await prisma.setting.update({
          where: { id: existingSettings.id },
          data,
        })
      : await prisma.setting.create({
          data,
        });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
