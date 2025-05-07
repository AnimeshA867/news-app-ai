import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import React from "react";

export const metadata = {
  title: "Page Not Found - NewsHub",
  description: "Sorry, the page you're looking for doesn't exist.",
  robots: "noindex",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container flex flex-col items-center justify-center min-h-[70vh] py-16 text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" /> Search Articles
            </Link>
          </Button>
        </div>

        <div className="mt-6 max-w-lg">
          <h3 className="font-semibold mb-2">Popular Categories</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Politics",
              "Business",
              "Technology",
              "Entertainment",
              "Sports",
            ].map((category) => (
              <Button key={category} variant="ghost" size="sm" asChild>
                <Link href={`/category/${category.toLowerCase()}`}>
                  {category}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
