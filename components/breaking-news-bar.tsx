"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setBreakingNews } from "@/lib/redux/store/articlesSlice";

interface BreakingNews {
  slug: string;
  title: string;
}

interface BreakingNewsBarProps {
  initialData?: BreakingNews[];
}

export function BreakingNewsBar({ initialData = [] }: BreakingNewsBarProps) {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const dispatch = useAppDispatch();

  // Get data from Redux with fallback to props
  const reduxBreakingNews = useAppSelector(
    (state) => state.article.breakingNews
  );
  const breakingNews =
    reduxBreakingNews.length > 0 ? reduxBreakingNews : initialData;

  // Store initial data in Redux if provided
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      dispatch(setBreakingNews(initialData));
    }
  }, [initialData, dispatch]);

  // Auto-rotate breaking news
  useEffect(() => {
    if (breakingNews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % breakingNews.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [breakingNews.length]);

  // If no breaking news, don't render anything
  if (!breakingNews || breakingNews.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-lg bg-primary py-2 text-primary-foreground px-4">
      <div className="container flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-bold uppercase">Breaking:</span>
        </div>
        <div className="relative h-6 flex-1 overflow-hidden">
          {breakingNews.map((news, index) => (
            <motion.div
              key={index}
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
