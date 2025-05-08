import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Add validation using a secure token here to prevent unauthorized unsubscribes
    // This is a simplified example

    // Delete subscriber
    await prisma.subscriber.delete({
      where: { email },
    });

    // Redirect to confirmation page
    return NextResponse.redirect(new URL("/unsubscribe-confirmed", req.url));
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
