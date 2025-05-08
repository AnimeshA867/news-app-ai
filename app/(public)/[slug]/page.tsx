import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { RichContent } from "@/components/ui/rich-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Get page from database
  const page = await prisma.page.findUnique({
    where: { slug, isPublished: true },
  });

  if (!page) {
    return {
      title: "Page Not Found",
      description:
        "The page you're looking for doesn't exist or has been moved.",
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc || undefined,
  };
}

// Generate static params for common pages
export async function generateStaticParams() {
  const commonSlugs = [
    "about",
    "contact",
    "careers",
    "advertise",
    "ethics-policy",
    "terms",
    "privacy",
    "cookie-policy",
    "accessibility",
  ];

  return commonSlugs.map((slug) => ({
    slug,
  }));
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug, isPublished: true },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{page.title}</h1>
        <div className="prose dark:prose-invert max-w-none">
          <RichContent content={page.content} />
        </div>
      </Card>
    </div>
  );
}
