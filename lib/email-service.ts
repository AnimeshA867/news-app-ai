import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { prisma } from "./prisma";
import NewsletterEmail from "@/components/emails/newsletter-template";
import React from "react";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function initEmailTransport() {
  const settings = await prisma.setting.findFirst();

  if (!settings?.smtpHost || !settings?.smtpPort || !settings?.smtpUsername) {
    throw new Error("SMTP settings not configured");
  }

  return nodemailer.createTransport({
    service: undefined, // This makes it use the host/port settings below
    host: settings.smtpHost,
    port: Number(settings.smtpPort),
    secure: Number(settings.smtpPort) === 465,
    auth: {
      user: settings.smtpUsername,
      pass: settings.smtpPassword,
    },
  } as nodemailer.TransportOptions);
}

export async function sendEmail(options: EmailOptions) {
  try {
    const settings = await prisma.setting.findFirst();
    const fromEmail = settings?.senderEmail || "news@example.com";
    const fromName = settings?.senderName || settings?.siteName || "News AI";

    const transport = await initEmailTransport();

    const info = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendNewsletterToSubscriber(
  newsletter: {
    subject: string;
    headline: string;
    intro?: string;
    articles: {
      title: string;
      excerpt: string;
      url: string;
      imageUrl?: string;
    }[];
  },
  subscriber: { email: string; name?: string | null }
) {
  const settings = await prisma.setting.findFirst();

  if (!settings) {
    throw new Error("Site settings not found");
  }

  const siteInfo = {
    siteName: settings.siteName,
    siteUrl: settings.siteUrl || "https://news.manasukh.com",
    logoUrl: settings.logoUrl || undefined,
  };

  const emailHtml = render(
    React.createElement(NewsletterEmail, {
      headline: newsletter.headline,
      intro: newsletter.intro,
      articles: newsletter.articles,
      siteInfo,
    })
  );
  const html = await emailHtml;

  return sendEmail({
    to: subscriber.email,
    subject: newsletter.subject,
    html: html,
  });
}
