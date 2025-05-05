import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: ArticlesState = {
  articles: [],
  featuredArticles: [],
  trendingArticles: [],
  breakingNews: [],
  topHeadlines: [],
  isLoading: false,
  searchQuery: "",
  statusFilter: "all",
  currentPage: 1,
  totalPages: 1,
};

const articlesSlice = createSlice({
  name: "articles",
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
    setBreakingNews(state, action: PayloadAction<BreakingNews[]>) {
      state.breakingNews = action.payload;
    },
  },
});

export const {
  setArticles,
  setFeaturedArticles,
  setTrendingArticles,
  setTopHeadlines,
  setBreakingNews,
} = articlesSlice.actions;

export default articlesSlice.reducer;
