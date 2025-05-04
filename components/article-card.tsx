import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
    publishedAt: Date;
    category: {
      name: string;
      slug: string;
    } | null;
    author: {
      name: string | null;
      image: string | null;
    } | null;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="group flex flex-col bg-background rounded-lg border overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {article.category && (
          <Badge className="absolute top-3 left-3" variant="secondary">
            <Link href={`/category/${article.category.slug}`}>
              {article.category.name}
            </Link>
          </Badge>
        )}
      </div>

      <div className="flex-1 p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={article.author?.image || undefined}
                alt={article.author?.name || "Author"}
              />
              <AvatarFallback>
                {article.author?.name?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {article.author?.name || "Anonymous"}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
