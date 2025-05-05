import { BreakingNewsBar } from "@/components/breaking-news-bar";
import { FeaturedGrid } from "@/components/featured-grid";
import { TrendingCarousel } from "@/components/trending-carousel";
import { TopHeadlines } from "@/components/top-headlines";
import { CategorySection } from "@/components/category-section";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { prisma } from "@/lib/prisma";
import { useDispatch, useSelector } from "react-redux";
import { setFeaturedArticles, setTrendingArticles, setTopHeadlines } from "@/store/articlesSlice";

export default async function HomePage() {
  const dispatch = useDispatch();
  const featuredArticles = useSelector((state) => state.articles.featuredArticles);
  const trendingArticles = useSelector((state) => state.articles.trendingArticles);
  const topHeadlines = useSelector((state) => state.articles.topHeadlines);

  // Fetch featured articles
  const fetchFeaturedArticles = async () => {
    const articles = await prisma.article.findMany({
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
    dispatch(setFeaturedArticles(articles));
  };

  // Fetch trending articles
  const fetchTrendingArticles = async () => {
    const articles = await prisma.article.findMany({
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
    dispatch(setTrendingArticles(articles));
  };

  // Fetch top headlines
  const fetchTopHeadlines = async () => {
    const articles = await prisma.article.findMany({
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
    dispatch(setTopHeadlines(articles));
  };

  useEffect(() => {
    fetchFeaturedArticles();
    fetchTrendingArticles();
    fetchTopHeadlines();
  }, [dispatch]);

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
