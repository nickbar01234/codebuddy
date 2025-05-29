import { devToolsEnhancer } from "@redux-devtools/remote";
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./session/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  enhancers: (defaultEnhancers) =>
    process.env.NODE_ENV === "development"
      ? defaultEnhancers().concat(
          devToolsEnhancer({
            name: "CodeBuddy",
            realtime: true,
            hostname: "localhost",
            port: 8001,
          })
        )
      : defaultEnhancers(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
