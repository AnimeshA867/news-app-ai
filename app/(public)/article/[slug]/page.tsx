import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Clock,
  Calendar,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, calculateReadTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/json-ld";
import { AdPosition } from "@/components/advertisements/ad-position";
import React from "react";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
    },
  });

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || undefined;
  const keywords = article.metaKeywords?.split(",") || undefined;

  return {
    title: title,
    description: description,
    keywords: keywords,
    robots: article.noIndex ? { index: false } : undefined,

    openGraph: {
      title: title,
      description: description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author?.name ? [article.author.name] : undefined,
      tags: keywords,
      url: `https://newshub-phi.vercel.app/article/${article.slug}`,
      images: article.featuredImage
        ? [{ url: article.featuredImage, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    alternates: {
      canonical: article.canonicalUrl || undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      category: true,
      tags: true,
    },
  });

  if (!article) {
    notFound();
  }
  await prisma.article.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });

  const relatedArticles = await prisma.article.findMany({
    where: {
      OR: [
        { categoryId: article.categoryId },
        { tags: { some: { id: { in: article.tags.map((tag) => tag.id) } } } },
      ],
      NOT: { id: article.id },
      status: "PUBLISHED",
    },
    take: 3,
    orderBy: {
      publishedAt: "desc",
    },
  });

  let structuredData = article.structuredData;

  if (!structuredData) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      description: article.excerpt || "",
      image: article.featuredImage ? [article.featuredImage] : [],
      datePublished: article.publishedAt?.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: article.author
        ? {
            "@type": "Person",
            name: article.author.name,
            url: article.author.id
              ? `https://yourdomain.com/author/${article.author.id}`
              : undefined,
          }
        : undefined,
      publisher: {
        "@type": "Organization",
        name: "NewsHub",
        logo: {
          "@type": "ImageObject",
          url: "https://yourdomain.com/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://yourdomain.com/article/${article.slug}`,
      },
    };

    structuredData = JSON.stringify(jsonLd);
  }

  const content = article.content;
  let paragraphs = content.split("</p>");
  paragraphs = paragraphs.map((p) => (p.trim() ? `${p}</p>` : p));
  const middleIndex = Math.max(2, Math.floor(paragraphs.length / 2));
  const firstHalf = paragraphs.slice(0, middleIndex).join("");
  const secondHalf = paragraphs.slice(middleIndex).join("");

  return (
    <>
      {article.jsonLd && (
        <JsonLd
          data={
            typeof article.jsonLd === "string"
              ? JSON.parse(article.jsonLd)
              : article.jsonLd
          }
        />
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <AdPosition
            position="header"
            pageType="article"
            pageId={article.id}
            className="w-full h-[90px] flex items-center justify-center"
            fallback={
              <div className="w-full h-[90px] bg-muted/10 rounded-md"></div>
            }
          />
        </div>

        <article className="mx-auto max-w-3xl">
          <header className="mb-8">
            <Link
              href={`/category/${article.category?.slug}`}
              className="text-sm font-medium text-primary mb-2 inline-block"
            >
              {article.category?.name}
            </Link>

            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <time dateTime={article.publishedAt?.toISOString() || ""}>
                  {article.publishedAt
                    ? formatDate(article.publishedAt)
                    : "Unpublished"}
                </time>
              </div>

              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{calculateReadTime(article.content)} min read</span>
              </div>
            </div>

            {article.featuredImage && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-8">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div className="my-6">
            <AdPosition
              position="before-content"
              pageType="article"
              pageId={article.id}
              className="w-full h-[250px] flex items-center justify-center"
              fallback={
                <div className="w-full h-[120px] bg-muted/10 rounded-md"></div>
              }
            />
          </div>

          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-base prose-img:rounded-lg prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: firstHalf }}
          />

          <div className="my-8 flex justify-center">
            <AdPosition
              position="in-article"
              pageType="article"
              pageId={article.id}
              className="max-w-[600px] h-[250px] flex items-center justify-center"
              fallback={
                <div className="w-full h-[250px] bg-muted/10 rounded-md"></div>
              }
            />
          </div>

          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-base prose-img:rounded-lg prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: secondHalf }}
          />

          <div className="my-8 flex justify-center">
            <AdPosition
              position="after-content"
              pageType="article"
              pageId={article.id}
              className="w-full h-[250px] flex items-center justify-center"
              fallback={
                <div className="w-full h-[120px] bg-muted/10 rounded-md"></div>
              }
            />
          </div>

          <Separator className="my-8" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="mb-2 font-medium">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Share:</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share via Email"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full object-center flex justify-center items-center">
                <Image
                  src={
                    article.author.image ||
                    "/placeholder.svg?height=100&width=100"
                  }
                  alt={article.author.name || "Author"}
                  width={64}
                  height={64}
                  className="rounded-full object-center"
                />
              </div>
              <div>
                <h3 className="font-bold">{article.author.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {article.author.role || "Writer"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">
              {`${article.author.name} is a writer for NewsHub.`}
            </p>
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/article/${related.slug}`}
                    className="group overflow-hidden rounded-lg border transition-colors hover:bg-muted/50"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={
                          related.featuredImage ||
                          "/placeholder.svg?height=300&width=400"
                        }
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold transition-colors group-hover:text-primary">
                        {related.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <AdPosition
              position="footer"
              pageType="article"
              pageId={article.id}
              className="w-full h-[90px] flex items-center justify-center"
              fallback={
                <div className="w-full h-[90px] bg-muted/10 rounded-md"></div>
              }
            />
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      </main>
    </>
  );
}
