import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

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
          siteUrl: null,
          socialImageUrl: null,
          twitterImageUrl: null,
          facebookImageUrl: null,
          senderEmail: "news@example.com",
          senderName: "News AI",
          smtpHost: null,
          smtpPort: null,
          smtpUsername: null,
          smtpPassword: null,
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
    if (
      !session?.user?.role ||
      !["ADMIN", "OWNER"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // For all email and feature settings, ensure they're properly handled if undefined
    const emailSettings = {
      senderEmail: data.senderEmail || null,
      senderName: data.senderName || null,
      smtpHost: data.smtpHost || null,
      smtpPort: data.smtpPort || null,
      smtpUsername: data.smtpUsername || null,
      smtpPassword: data.smtpPassword || null,
    };

    const featureSettings = {
      enableNewsletter:
        data.enableNewsletter === undefined ? true : data.enableNewsletter,
      enableSearch: data.enableSearch === undefined ? true : data.enableSearch,
      enableSocialSharing:
        data.enableSocialSharing === undefined
          ? true
          : data.enableSocialSharing,
      enableRelatedArticles:
        data.enableRelatedArticles === undefined
          ? true
          : data.enableRelatedArticles,
    };

    // Update settings with all fields properly handled
    const settings = await prisma.setting.upsert({
      where: { id: data.id || "default" },
      create: {
        id: data.id || "default",
        siteName: data.siteName || "News AI",
        siteUrl: data.siteUrl || null,
        tagline: data.tagline || null,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        socialImageUrl: data.socialImageUrl || null,
        twitterImageUrl: data.twitterImageUrl || null,
        facebookImageUrl: data.facebookImageUrl || null,
        ...emailSettings,
        ...featureSettings,
      },
      update: {
        siteName: data.siteName,
        siteUrl: data.siteUrl,
        tagline: data.tagline,
        description: data.description,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        socialImageUrl: data.socialImageUrl,
        twitterImageUrl: data.twitterImageUrl,
        facebookImageUrl: data.facebookImageUrl,
        ...emailSettings,
        ...featureSettings,
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
