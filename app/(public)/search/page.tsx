"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, Filter, Loader2 } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

export default function SearchPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const storedCategories = useAppSelector((state) => state.category.categories);

  const storedArticles = useAppSelector((state) => state.article.topHeadlines);

  useEffect(() => {
    if (storedCategories.length > 0) {
      setCategories(storedCategories);
    }
    if (storedArticles.length > 0) {
      setArticles(storedArticles);
      setFilteredArticles(storedArticles);
      setTotalResults(storedArticles.length);
      setTotalPages(Math.ceil(storedArticles.length / 10));
    }
  }, [storedCategories, storedArticles]);

  // Fetch articles with debounce
  const fetchArticles = useCallback(async () => {
    setIsSearching(true);
    try {
      let url = `/api/articles?page=${currentPage}&limit=10`;

      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      }

      // Only add the category parameter if it's not "all"
      if (selectedCategory && selectedCategory !== "all") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      if (sortBy === "newest") {
        url += "&sort=desc";
      } else if (sortBy === "oldest") {
        url += "&sort=asc";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();

      if (data.articles && Array.isArray(data.articles)) {
        setArticles(data.articles);
        setFilteredArticles(data.articles);
        setTotalResults(data.meta?.total || data.articles.length);
        setTotalPages(data.meta?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [searchQuery, selectedCategory, sortBy, currentPage]);

  // Debounce search input
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on new search
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy, fetchArticles]);

  // Calculate estimated read time (if not provided by API)
  const getReadTime = (article: Article) => {
    if (article.readTime) return article.readTime;

    // Estimate based on title + excerpt length (avg reading speed: 200 words/min)
    const wordCount = (article.title + " " + article.excerpt).split(
      /\s+/
    ).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  return (
    <main className="container py-8">
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
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
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
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-muted-foreground">
            {isLoading || isSearching
              ? "Searching..."
              : filteredArticles.length === 0
              ? "No results found"
              : `Found ${totalResults} result${totalResults === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="space-y-6">
          {isLoading || isSearching ? (
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
                Try adjusting your search or filter to find what you&apos;re
                looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSortBy("newest");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              {filteredArticles.map((article, index) => (
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
                        src={article.featuredImage || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 96px, 96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      {article.category && (
                        <Badge className="mb-2">{article.category.name}</Badge>
                      )}
                      <h2 className="mb-1 font-bold">{article.title}</h2>
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.author?.name || "Anonymous"}</span>
                        <span>{formatDate(article.publishedAt)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {getReadTime(article)}{" "}
                          min read
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    Previous
                  </Button>

                  <span className="flex items-center px-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
