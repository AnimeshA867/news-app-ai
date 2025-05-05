import { configureStore } from "@reduxjs/toolkit";
import articleReducer from "@/lib/redux/store/articlesSlice";
import statsReducer from "@/lib/redux/store/statsSlice";
import categoryReducer from "@/lib/redux/store/categoriesSlice";
/* 
import tagReducer from "@/store/tagSlice";
import authorReducer from "@/store/authorSlice"; */

// Helper function to serialize dates in actions before they reach the store
const dateSerializerMiddleware = (store) => (next) => (action) => {
  const serializeData = (data) => {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    if (Array.isArray(data)) {
      return data.map(serializeData);
    }

    if (typeof data === "object") {
      const result = {};
      for (const key in data) {
        result[key] = serializeData(data[key]);
      }
      return result;
    }

    return data;
  };

  // Serialize any Date objects in the action before sending to reducer
  if (action?.payload) {
    action.payload = serializeData(action.payload);
  }

  return next(action);
};

export const store = configureStore({
  reducer: {
    article: articleReducer,
    stats: statsReducer,
    category: categoryReducer,
    // category: categoryReducer,
    // tag: tagReducer,
    // author: authorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // If needed, you can specify specific paths to ignore
        ignoredActions: ["article/setBreakingNews/fulfilled"],
        ignoredPaths: ["article.lastFetched"],
      },
    }).concat(dateSerializerMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
