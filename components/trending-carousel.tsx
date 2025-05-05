"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrendingCarouselProps {
  articles: Article[];
}

export function TrendingCarousel({ articles }: TrendingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 768) {
        setVisibleItems(2);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!articles || articles.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, articles.length - visibleItems);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="my-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Now</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={containerRef}
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {articles.map((article) => (
            <motion.div
              key={article.id}
              className={`w-full shrink-0 px-2 ${
                visibleItems === 1
                  ? "w-full"
                  : visibleItems === 2
                  ? "w-1/2"
                  : visibleItems === 3
                  ? "w-1/3"
                  : "w-1/4"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onMouseEnter={() => setHoveredArticle(article.id)}
              onMouseLeave={() => setHoveredArticle(null)}
            >
              <Link href={`/article/${article.slug}`} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                  <Image
                    src={
                      article.featuredImage ||
                      "/placeholder.svg?height=400&width=600"
                    }
                    alt={article.title}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500",
                      hoveredArticle === article.id && "scale-105"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Badge className="mb-2 bg-primary hover:bg-primary/90">
                      {article.category?.name}
                    </Badge>
                    <h3 className="font-bold text-white">{article.title}</h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
