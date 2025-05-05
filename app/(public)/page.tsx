import { BreakingNewsBar } from "@/components/breaking-news-bar";
import { FeaturedGrid } from "@/components/featured-grid";
import { TrendingCarousel } from "@/components/trending-carousel";
import { TopHeadlines } from "@/components/top-headlines";
import { CategorySection } from "@/components/category-section";
import { NewsletterSignup } from "@/components/newsletter-signup";
import {
  fetchBreakingNews,
  fetchFeaturedArticles,
  fetchTopHeadlines,
  fetchTrendingArticles,
} from "@/utils/fetcher";

export default async function HomePage() {
  const featuredArticles: Article[] = await fetchFeaturedArticles();
  const trendingArticles = await fetchTrendingArticles();
  const topHeadlines = await fetchTopHeadlines();
  const breakingNews = await fetchBreakingNews();
  return (
    <main className="container mx-auto px-4 py-6">
      <BreakingNewsBar initialData={breakingNews} />
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
