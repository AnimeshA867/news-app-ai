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
    const session = await getServerSession(authOptions);

    // Authentication check
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Update settings - ensuring we include the new fields
    const settings = await prisma.setting.upsert({
      where: { id: data.id || "default" },
      create: {
        id: data.id || "default",
        siteName: data.siteName || "News AI",
        tagline: data.tagline || null,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        // Add new social image fields
        socialImageUrl: data.socialImageUrl || null,
        twitterImageUrl: data.twitterImageUrl || null,
        facebookImageUrl: data.facebookImageUrl || null,
        // Rest of your fields
        senderEmail: data.senderEmail || null,
        senderName: data.senderName || null,
        // ... other fields
      },
      update: {
        siteName: data.siteName,
        tagline: data.tagline,
        description: data.description,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        // Add new social image fields
        socialImageUrl: data.socialImageUrl,
        twitterImageUrl: data.twitterImageUrl,
        facebookImageUrl: data.facebookImageUrl,
        // Rest of your updated fields
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        // ... other fields
      },
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
