"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const breakingNews = [
  {
    id: 1,
    title: "Major policy shift announced by government on climate change",
    href: "/article/major-policy-shift-climate-change",
  },
  {
    id: 2,
    title:
      "Tech giant unveils revolutionary AI system that can predict market trends",
    href: "/article/tech-giant-ai-system-market-trends",
  },
  {
    id: 3,
    title: "Global summit on pandemic preparedness begins amid rising concerns",
    href: "/article/global-summit-pandemic-preparedness",
  },
];

export function BreakingNewsBar() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % breakingNews.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

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
                  href={news.href}
                  className="block truncate hover:underline"
                >
                  {news.title}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
