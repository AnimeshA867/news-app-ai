import { configureStore } from '@reduxjs/toolkit';
import articlesReducer from './articlesSlice';
import statsReducer from './statsSlice';

const store = configureStore({
  reducer: {
    articles: articlesReducer,
    stats: statsReducer,
  },
});

export default store;
