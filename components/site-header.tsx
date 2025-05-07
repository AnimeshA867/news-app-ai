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
  });

  // If database fetch fails, use a fallback set of categories
  const fallbackCategories = [
    { id: "1", name: "Politics", slug: "politics" },
    { id: "2", name: "World", slug: "world" },
    // Rest of the fallback categories...
  ];

  return (
    <SiteHeaderClient
      categories={categories.length > 0 ? categories : fallbackCategories}
    />
  );
}
