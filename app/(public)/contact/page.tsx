import { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { RichContent } from "@/components/ui/rich-content";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with our team for inquiries, feedback, or support.",
};

export default async function ContactPage() {
  // Get the contact page content from the database
  const contactPage = await prisma.page.findUnique({
    where: { slug: "contact", isPublished: true },
  });

  return (
    <div className="container max-w-6xl py-12">
      <h1 className="text-3xl font-bold mb-6 md:text-4xl">Contact Us</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-3">
          {/* Contact form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
            <p className="text-muted-foreground mb-6">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </p>
            <ContactForm />
          </Card>
        </div>
      </div>

      {/* Display the page content from CMS if available */}
      {contactPage && contactPage.content && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <RichContent content={contactPage.content} />
        </div>
      )}
    </div>
  );
}
