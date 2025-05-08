import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find subscriber with this token
    const subscriber = await prisma.subscriber.findFirst({
      where: { verifyToken: token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Update subscriber to verified
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        verified: true,
        verifyToken: null, // Clear token after verification
      },
    });

    // Redirect to confirmation page
    return NextResponse.redirect(new URL("/subscription-confirmed", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription" },
      { status: 500 }
    );
  }
}
