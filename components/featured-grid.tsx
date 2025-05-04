"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Author {
  id: string
  name: string | null
  image: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  readTime: number | null
  publishedAt: Date | null
  author: Author
  category: Category
}

interface FeaturedGridProps {
  articles: Article[]
}

export function FeaturedGrid({ articles }: FeaturedGridProps) {
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null)

  if (!articles || articles.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h2 className="text-xl font-medium">No featured articles</h2>
        <p className="mt-2 text-muted-foreground">Check back soon for featured stories.</p>
      </div>
    )
  }

  const mainArticle = articles[0]
  const secondaryArticles = articles.slice(1, 5)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Stories</h2>
        <Link href="/featured" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          className="relative col-span-full overflow-hidden rounded-lg md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onMouseEnter={() => setHoveredArticle(mainArticle.id)}
          onMouseLeave={() => setHoveredArticle(null)}
        >
          <Link href={`/article/${mainArticle.slug}`} className="group block">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={mainArticle.featuredImage || "/placeholder.svg?height=600&width=800"}
                alt={mainArticle.title}
                fill
                className={cn(
                  "object-cover transition-transform duration-500",
                  hoveredArticle === mainArticle.id && "scale-105",
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <Badge className="mb-2 bg-primary hover:bg-primary/90">{mainArticle.category.name}</Badge>
              <h3 className="mb-2 text-xl font-bold text-white md:text-2xl lg:text-3xl">{mainArticle.title}</h3>
              <p className="mb-4 hidden text-white/90 md:block">{mainArticle.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>{mainArticle.author.name}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {mainArticle.readTime || 5} min read
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {secondaryArticles.map((article, index) => (
          <motion.div
            key={article.id}
            className="overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            onMouseEnter={() => setHoveredArticle(article.id)}
            onMouseLeave={() => setHoveredArticle(null)}
          >
            <Link href={`/article/${article.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={article.featuredImage || "/placeholder.svg?height=300&width=400"}
                  alt={article.title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-500",
                    hoveredArticle === article.id && "scale-105",
                  )}
                />
              </div>
              <div className="p-3">
                <Badge variant="outline" className="mb-2">
                  {article.category.name}
                </Badge>
                <h3 className="mb-1 font-bold transition-colors group-hover:text-primary">{article.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{article.author.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {article.readTime || 3} min
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
