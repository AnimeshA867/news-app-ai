import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
// Removed unused import
import { ChevronRight } from "lucide-react"; // Removed unused 'Clock'

import { prisma } from "@/lib/prisma";
// Removed unused import
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Fix the interface definition
interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = params; // Removed unnecessary 'await'

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} News - NewsHub`,
    description:
      category.description || `Latest ${category.name} news and updates`,
    openGraph: {
      title: `${category.name} News - NewsHub`,
      description:
        category.description || `Latest ${category.name} news and updates`,
      url: `https://newshub-phi.vercel.app/category/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} News - NewsHub`,
      description:
        category.description || `Latest ${category.name} news and updates`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  // Remove await from these lines
  const { page: pageParam } = searchParams;
  const { slug } = params; // Removed unnecessary 'await'
  const page = Number(pageParam) || 1;
  const pageSize = 6;

  // Fetch category and its articles
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where: {
          status: "PUBLISHED",
        },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          category: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      },
      _count: {
        select: {
          articles: {
            where: {
              status: "PUBLISHED",
            },
          },
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const totalArticles = category._count.articles;
  const totalPages = Math.ceil(totalArticles / pageSize);

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{category.name}</span>
      </div>

      <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-lg text-muted-foreground mb-8">
          {category.description}
        </p>
      )}

      <Suspense fallback={<ArticlesLoadingSkeleton />}>
        {category.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.articles.map(
              (article) =>
                article && (
                  <ArticleCard
                    key={article.id}
                    article={{
                      ...article,
                      excerpt: article.excerpt || "",
                      publishedAt: article.publishedAt || new Date(0),
                    }}
                  />
                )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">No articles found</h2>
            <p className="text-muted-foreground mb-6">
              There are no articles in this category yet.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={`/category/${slug}?page=${page - 1}`}>Previous</Link>
            ) : (
              "Previous"
            )}
          </Button>

          <span className="flex items-center mx-4">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <Link href={`/category/${slug}?page=${page + 1}`}>Next</Link>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function ArticlesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
