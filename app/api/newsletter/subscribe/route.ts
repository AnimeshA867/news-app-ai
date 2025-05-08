import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const settings = await prisma.setting.findFirst();

    if (!settings?.enableNewsletter) {
      return NextResponse.json(
        { error: "Newsletter service is not enabled" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, name } = result.data;

    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { message: "Email already subscribed" },
        { status: 200 }
      );
    }

    // Create subscriber directly as verified
    await prisma.subscriber.create({
      data: {
        email,
        name,
        verified: true, // Set as verified directly
        verifyToken: null, // No verification token needed
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
