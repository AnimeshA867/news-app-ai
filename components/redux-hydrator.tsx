"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  setFeaturedArticles,
  setTrendingArticles,
  setBreakingNews,
} from "@/lib/redux/store/articlesSlice";

interface ReduxHydratorProps {
  featuredArticles?: any[];
  trendingArticles?: any[];
  breakingNews?: BreakingNewsArticle;
}

export function ReduxHydrator({
  featuredArticles,
  trendingArticles,
  breakingNews,
}: ReduxHydratorProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (featuredArticles && featuredArticles.length > 0) {
      dispatch(setFeaturedArticles(featuredArticles));
    }

    if (trendingArticles && trendingArticles.length > 0) {
      dispatch(setTrendingArticles(trendingArticles));
    }

    if (breakingNews && breakingNews.breakingNews.length > 0) {
      dispatch(setBreakingNews(breakingNews.breakingNews));
    }
  }, [dispatch, featuredArticles, trendingArticles, breakingNews]);

  return null;
}
