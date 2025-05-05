"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Loader2, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCategories } from "@/lib/redux/store/categoriesSlice";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CategoryList = ({ categories }: { categories: Category[] }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Dispatch categories to Redux after mount (not during render)
  useEffect(() => {
    const fetchCategories = async () => {
      if (categories && categories.length > 0) {
        dispatch(setCategories(categories));
      }

      fetchCategories();
    };
  }, [dispatch, categories]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default CategoryList;
