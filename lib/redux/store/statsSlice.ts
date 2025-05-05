import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface CategoryStat {
  name: string;
  count: number;
}

export interface StatsData {
  counts: {
    articles: number;
    publishedArticles: number;
    categories: number;
    tags: number;
    users: number;
  };
  articleStatusCounts: StatusCount[];
  categoryStats: CategoryStat[];
  recentActivity: ActivityUser[];
}

export interface StatsState {
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  stats: null,
  isLoading: false,
  error: null,
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<Partial<StatsState>>) => {
      return { ...state, ...action.payload };
    },
    clearStats: (state) => {
      state.stats = null;
    },
  },
});

export const { setStats, clearStats } = statsSlice.actions;

export default statsSlice.reducer;
