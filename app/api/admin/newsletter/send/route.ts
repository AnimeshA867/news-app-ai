import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewsletterToSubscriber } from "@/lib/email-service";
import { z } from "zod";
import { Session } from "../../../../../lib/generated/index";

const newsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  headline: z.string().min(1, "Headline is required"),
  intro: z.string().optional(),
  articleIds: z.array(z.string()).min(1, "At least one article is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and permission
    if (
      !session?.user ||
      !["ADMIN", "OWNER", "EDITOR"].includes(session.user.role as string)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findFirst();
    if (!settings?.enableNewsletter) {
      return NextResponse.json(
        { error: "Newsletter feature is not enabled" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { subject, headline, intro, articleIds } = result.data;

    // Get articles
    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        featuredImage: true,
      },
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No valid published articles found" },
        { status: 400 }
      );
    }

    // Get verified subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { verified: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No verified subscribers found" },
        { status: 400 }
      );
    }

    // Format articles for newsletter
    const siteUrl = settings.siteUrl || "https://news.manasukh.com";
    const newsletterArticles = articles.map((article) => ({
      title: article.title,
      excerpt: article.excerpt || "",
      url: `${siteUrl}/article/${article.slug}`,
      imageUrl: article.featuredImage || undefined,
    }));

    // Create newsletter record
    const newsletter = await prisma.newsletter.create({
      data: {
        subject,
        content: JSON.stringify({
          headline,
          intro,
          articles: newsletterArticles,
        }),
        sentTo: subscribers.length,
      },
    });

    // Send newsletter to all subscribers (consider using a queue system for production)
    const sendPromises = subscribers.map((subscriber) =>
      sendNewsletterToSubscriber(
        {
          subject,
          headline,
          intro,
          articles: newsletterArticles,
        },
        subscriber
      )
    );

    await Promise.all(sendPromises);

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      newsletterId: newsletter.id,
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
