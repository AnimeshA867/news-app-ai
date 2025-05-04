"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - would be fetched from API in production
const allArticles = [
  {
    id: 1,
    title:
      "Global Leaders Gather for Climate Summit as Protests Erupt Worldwide",
    excerpt:
      "World leaders convene in Geneva to address climate crisis amid growing public pressure for immediate action.",
    category: "Politics",
    image: "/placeholder.svg?height=200&width=300",
    author: "Sarah Johnson",
    date: "2023-05-15",
    readTime: 8,
    slug: "global-leaders-climate-summit",
  },
  {
    id: 2,
    title:
      "Tech Giant Unveils Revolutionary AI System That Can Predict Market Trends",
    excerpt:
      "New artificial intelligence platform claims to forecast economic shifts with unprecedented accuracy.",
    category: "Technology",
    image: "/placeholder.svg?height=200&width=300",
    author: "Michael Chen",
    date: "2023-05-14",
    readTime: 6,
    slug: "tech-giant-ai-market-prediction",
  },
  {
    id: 3,
    title: "Historic Peace Agreement Signed After Decades of Regional Conflict",
    excerpt:
      "Landmark treaty brings hope for stability in region plagued by generations of unrest and violence.",
    category: "World",
    image: "/placeholder.svg?height=200&width=300",
    author: "Omar Al-Farsi",
    date: "2023-05-13",
    readTime: 7,
    slug: "historic-peace-agreement-signed",
  },
  {
    id: 4,
    title:
      "Breakthrough Medical Research Offers New Hope for Chronic Disease Patients",
    excerpt:
      "Scientists announce promising results from clinical trials of innovative treatment approach.",
    category: "Health",
    image: "/placeholder.svg?height=200&width=300",
    author: "Dr. Elena Rodriguez",
    date: "2023-05-12",
    readTime: 5,
    slug: "breakthrough-medical-research-chronic-disease",
  },
  {
    id: 5,
    title: "Major Sports League Announces Expansion to International Markets",
    excerpt:
      "Popular sports franchise reveals ambitious plans to establish teams across three continents.",
    category: "Sports",
    image: "/placeholder.svg?height=200&width=300",
    author: "James Wilson",
    date: "2023-05-11",
    readTime: 4,
    slug: "sports-league-international-expansion",
  },
  {
    id: 6,
    title: "Cryptocurrency Market Surges as Regulatory Clarity Emerges",
    excerpt:
      "Digital currency values climb following announcement of new government oversight framework.",
    category: "Business",
    image: "/placeholder.svg?height=200&width=300",
    author: "Jennifer Lee",
    date: "2023-05-10",
    readTime: 6,
    slug: "cryptocurrency-market-surges",
  },
  {
    id: 7,
    title: "New Study Reveals Surprising Benefits of Intermittent Fasting",
    excerpt:
      "Research findings challenge conventional wisdom about optimal eating patterns for health and longevity.",
    category: "Health",
    image: "/placeholder.svg?height=200&width=300",
    author: "Dr. Marcus Johnson",
    date: "2023-05-09",
    readTime: 7,
    slug: "benefits-intermittent-fasting",
  },
  {
    id: 8,
    title: "Major Film Studio Announces Slate of Upcoming Superhero Movies",
    excerpt:
      "Entertainment giant unveils ambitious five-year plan for popular comic book franchise adaptations.",
    category: "Entertainment",
    image: "/placeholder.svg?height=200&width=300",
    author: "Rebecca Martinez",
    date: "2023-05-08",
    readTime: 5,
    slug: "film-studio-superhero-movies",
  },
];

const categories = [
  "All Categories",
  "Politics",
  "World",
  "Business",
  "Technology",
  "Entertainment",
  "Sports",
  "Health",
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("relevance");
  const [filteredArticles, setFilteredArticles] = useState(allArticles);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      let results = [...allArticles];

      // Filter by search query
      if (searchQuery) {
        results = results.filter(
          (article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (selectedCategory !== "All Categories") {
        results = results.filter(
          (article) => article.category === selectedCategory
        );
      }

      // Sort results
      if (sortBy === "newest") {
        results.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      } else if (sortBy === "oldest") {
        results.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
      // For "relevance", we keep the original order (assuming it's already sorted by relevance)

      setFilteredArticles(results);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold md:text-4xl">Search Articles</h1>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for articles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-muted-foreground">
            {isLoading
              ? "Searching..."
              : filteredArticles.length === 0
              ? "No results found"
              : `Found ${filteredArticles.length} result${
                  filteredArticles.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse gap-4 rounded-lg border p-4"
              >
                <div className="h-24 w-24 rounded-md bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-3 w-1/2 rounded bg-muted"></div>
                  <div className="h-3 w-full rounded bg-muted"></div>
                  <div className="h-3 w-full rounded bg-muted"></div>
                </div>
              </div>
            ))
          ) : filteredArticles.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <h2 className="mb-2 text-xl font-medium">No results found</h2>
              <p className="mb-4 text-muted-foreground">
                Try adjusting your search or filter to find what you&apos;re looking
                for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Categories");
                  setSortBy("relevance");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={`/article/${article.slug}`}
                  className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge className="mb-2">{article.category}</Badge>
                    <h2 className="mb-1 font-bold">{article.title}</h2>
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {article.readTime} min
                        read
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
