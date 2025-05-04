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
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, calculateReadTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug: slug },
    include: {
      author: true,
      tags: true,
    },
  });

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name || ""],
      tags: article.tags.map((tag) => tag.name),
      images: [
        {
          url:
            article.featuredImage || "/placeholder.svg?height=600&width=1200",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
      images: [
        article.featuredImage || "/placeholder.svg?height=600&width=1200",
      ],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Increment view count

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      tags: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!article) {
    notFound();
  }
  await prisma.article.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });

  // Get related articles based on category and tags
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

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <Badge className="mb-4">{article.category.name}</Badge>
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mb-6 text-xl text-muted-foreground">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src={
                  article.author.image ||
                  "/placeholder.svg?height=100&width=100"
                }
                alt={article.author.name || "Author"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {article.readTime || calculateReadTime(article.content)} min
                read
              </span>
            </div>
          </div>
        </header>

        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={
              article.featuredImage || "/placeholder.svg?height=600&width=1200"
            }
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-base prose-img:rounded-lg border border-black"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

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
            <Image
              src={
                article.author.image || "/placeholder.svg?height=100&width=100"
              }
              alt={article.author.name || "Author"}
              width={64}
              height={64}
              className="rounded-full"
            />
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

        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">
              Comments ({article.comments.length})
            </h3>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
            </Button>
          </div>
          {article.comments.length > 0 ? (
            <div className="space-y-4">
              {article.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Image
                      src={
                        comment.user.image ||
                        "/placeholder.svg?height=50&width=50"
                      }
                      alt={comment.user.name || "User"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Be the first to comment on this article.
            </p>
          )}
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
      </article>
    </main>
  );
}
