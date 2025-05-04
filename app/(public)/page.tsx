import { BreakingNewsBar } from "@/components/breaking-news-bar";
import { FeaturedGrid } from "@/components/featured-grid";
import { TrendingCarousel } from "@/components/trending-carousel";
import { TopHeadlines } from "@/components/top-headlines";
import { CategorySection } from "@/components/category-section";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Fetch featured articles
  const featuredArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
    ],
    take: 5,
  });

  // Fetch trending articles
  const trendingArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      category: true,
    },
    orderBy: [
      {
        viewCount: "desc",
      },
    ],
    take: 6,
  });

  // Fetch top headlines
  const topHeadlines = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
    ],
    take: 7,
  });

  return (
    <main className="container mx-auto px-4 py-6">
      <BreakingNewsBar />
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <FeaturedGrid articles={featuredArticles} />
        </div>
        <div className="md:col-span-4">
          <TopHeadlines headlines={topHeadlines} />
        </div>
      </div>
      <TrendingCarousel articles={trendingArticles} />
      <div className="my-12 grid gap-12 md:grid-cols-2">
        <CategorySection category="politics" limit={4} />
        <CategorySection category="business" limit={4} />
      </div>
      <div className="my-12 grid gap-12 md:grid-cols-2">
        <CategorySection category="technology" limit={4} />
        <CategorySection category="entertainment" limit={4} />
      </div>
      <NewsletterSignup />
    </main>
  );
}
