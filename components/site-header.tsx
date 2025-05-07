import Link from "next/link";
import { SiteHeaderClient } from "./site-header-client";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  // Fetch categories from the database on the server
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },

    // Optionally limit the number of categories
  });

  // If database fetch fails, use a fallback set of categories
  const fallbackCategories = [
    { id: "1", name: "Politics", slug: "politics" },
    { id: "2", name: "World", slug: "world" },
    { id: "3", name: "Business", slug: "business" },
    { id: "4", name: "Technology", slug: "technology" },
    { id: "5", name: "Entertainment", slug: "entertainment" },
    { id: "6", name: "Sports", slug: "sports" },
    { id: "7", name: "Health", slug: "health" },
  ];

  return (
    <SiteHeaderClient
      categories={categories.length > 0 ? categories : fallbackCategories}
    />
  );
}
