interface Article {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId?: string | null;
  categoryId?: string | null;
  viewCount?: number | null;
  readTime?: number | null;
  isBreakingNews?: boolean;
  isFeatured?: boolean;
  author?: {
    id: string;
    name: string | null;
    image?: string | null;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  comments?: any[];
}

interface ArticlesState {
  articles: Article[];
  featuredArticles: Article[];
  trendingArticles: Article[];
  topHeadlines: Article[];
  breakingNews: BreakingNews[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

type BreakingNews = {
  title: string;
  slug: string;
};

interface BreakingNewsArticle {
  breakingNews: BreakingNews[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}
