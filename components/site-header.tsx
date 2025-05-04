"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import React from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories from the API

  const categories = [
    { id: "1", name: "Politics", slug: "politics" },
    { id: "2", name: "World", slug: "world" },
    { id: "3", name: "Business", slug: "business" },
    { id: "4", name: "Technology", slug: "technology" },
    { id: "5", name: "Entertainment", slug: "entertainment" },
    { id: "6", name: "Sports", slug: "sports" },
    { id: "7", name: "Health", slug: "health" },
  ];
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background transition-shadow duration-200",
        isScrolled && "shadow-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary"
            >
              <span className="text-lg font-bold text-primary-foreground">
                N
              </span>
            </motion.div>
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl font-bold tracking-tight"
            >
              NewsHub
            </motion.span>
          </Link>
          <nav className="hidden md:flex md:gap-6 items-center">
            {isLoading ? (
              // Show loading placeholders for categories
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-16 rounded animate-pulse bg-muted"
                  />
                ))}
                <div className="h-8 w-8 rounded-full animate-pulse bg-muted" />
              </>
            ) : (
              // Show fetched categories
              <>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === `/category/${category.slug}`
                        ? "text-primary"
                        : "text-foreground/70"
                    )}
                  >
                    {category.name}
                  </Link>
                ))}
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/search">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          <Button size="sm" className="hidden md:inline-flex" asChild>
            <Link href="/subscribe">Subscribe</Link>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-background pt-16"
          >
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <nav className="flex flex-col space-y-4 p-6">
              {isLoading ? (
                // Mobile menu loading state
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                // Mobile menu categories
                <>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    href="/search"
                    className="text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search
                  </Link>
                  <Link
                    href="/subscribe"
                    className="text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Subscribe
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
