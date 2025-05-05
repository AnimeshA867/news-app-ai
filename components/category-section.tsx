import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryArticles } from "@/utils/fetcher";

interface CategorySectionProps {
  category: string;
  limit?: number;
  className?: string;
}

// Cache the fetch function to avoid duplicate requests

export async function CategorySection({
  category,
  limit = 4,
  className,
}: CategorySectionProps) {
  const categoryData = await getCategoryArticles(category, limit);

  if (!categoryData || !categoryData.articles.length) {
    return null;
  }

  const categoryTitle = categoryData.name;
  const articles = categoryData.articles;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{categoryTitle}</h2>
        <Link
          href={`/category/${category}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="group flex gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
              <Image
                src={
                  article.featuredImage ||
                  "/placeholder.svg?height=200&width=300"
                }
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium transition-colors group-hover:text-primary">
                {article.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {article.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
