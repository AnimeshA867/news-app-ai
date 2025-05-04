"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

interface BreakingNewsArticle {
  id: string;
  title: string;
  slug: string;
}

export function BreakingNewsBar() {
  const [breakingNews, setBreakingNews] = useState<BreakingNewsArticle[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    async function fetchBreakingNews() {
      try {
        const response = await fetch("/api/articles?breaking=true&limit=5");
        if (!response.ok) {
          throw new Error("Failed to fetch breaking news");
        }
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
          setBreakingNews(
            data.articles.map((article: any) => ({
              id: article.id,
              title: article.title,
              slug: article.slug,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching breaking news:", error);
      } finally {
        setIsLoading(false);
      }
    }
    return () => {
      fetchBreakingNews();
    };
  }, []);

  useEffect(() => {
    if (breakingNews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % breakingNews.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [breakingNews.length]);

  if (isLoading) {
    return (
      <div className="relative mb-6 overflow-hidden rounded-lg bg-primary py-2 text-primary-foreground animate-pulse">
        <div className="container flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold uppercase">Breaking:</span>
          </div>
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Loading breaking news...</span>
          </div>
        </div>
      </div>
    );
  }

  if (breakingNews.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-lg bg-primary py-2 text-primary-foreground">
      <div className="container flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-bold uppercase">Breaking:</span>
        </div>
        <div className="relative h-6 flex-1 overflow-hidden">
          {breakingNews.map((news, index) => (
            <motion.div
              key={news.id}
              className="absolute w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: currentNewsIndex === index ? 1 : 0,
                y: currentNewsIndex === index ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
            >
              {currentNewsIndex === index && (
                <Link
                  href={`/article/${news.slug}`}
                  className="block truncate hover:underline"
                >
                  {news.title}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
        {breakingNews.length > 1 && (
          <div className="hidden md:flex items-center gap-1">
            {breakingNews.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  currentNewsIndex === index
                    ? "w-4 bg-primary-foreground"
                    : "w-1.5 bg-primary-foreground/50 hover:bg-primary-foreground/70"
                }`}
                onClick={() => setCurrentNewsIndex(index)}
                aria-label={`Breaking news ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
