import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  category: {
    name: string;
  };
  author: {
    name: string | null;
  };
}

interface ArticlesState {
  articles: Article[];
  featuredArticles: Article[];
  trendingArticles: Article[];
  topHeadlines: Article[];
  isLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
}

const initialState: ArticlesState = {
  articles: [],
  featuredArticles: [],
  trendingArticles: [],
  topHeadlines: [],
  isLoading: false,
  searchQuery: '',
  statusFilter: 'all',
  currentPage: 1,
  totalPages: 1,
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setArticles(state, action: PayloadAction<Partial<ArticlesState>>) {
      return { ...state, ...action.payload };
    },
    setFeaturedArticles(state, action: PayloadAction<Article[]>) {
      state.featuredArticles = action.payload;
    },
    setTrendingArticles(state, action: PayloadAction<Article[]>) {
      state.trendingArticles = action.payload;
    },
    setTopHeadlines(state, action: PayloadAction<Article[]>) {
      state.topHeadlines = action.payload;
    },
  },
});

export const { setArticles, setFeaturedArticles, setTrendingArticles, setTopHeadlines } = articlesSlice.actions;

export default articlesSlice.reducer;
