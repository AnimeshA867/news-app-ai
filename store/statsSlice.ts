import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Stats {
  articles: number;
  publishedArticles: number;
  categories: number;
  tags: number;
  users: number;
}

interface StatsState {
  stats: Stats | null;
  isLoading: boolean;
}

const initialState: StatsState = {
  stats: null,
  isLoading: false,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    setStats(state, action: PayloadAction<Partial<StatsState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setStats } = statsSlice.actions;

export default statsSlice.reducer;
