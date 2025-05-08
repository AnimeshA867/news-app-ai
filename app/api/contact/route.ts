import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Define validation schema
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  reason: z.string(),
  message: z.string().min(10).max(1000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request data
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, reason, message } = result.data;

    // Get settings to determine notification email
    const settings = await prisma.setting.findFirst();

    // Store message in database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        reason,
        message,
        status: "NEW",
      },
    });

    // If email sending is set up, send notification email
    if (settings?.smtpHost && settings?.smtpUsername && settings?.senderEmail) {
      try {
        // You can add email sending code here using your nodemailer setup
        // This is optional and can be implemented later
        console.log("Would send email to:", settings.senderEmail);
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // We don't want to fail the request if just email sending fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message received successfully",
      id: contact.id,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process your message" },
      { status: 500 }
    );
  }
}
