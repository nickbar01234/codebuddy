import { devToolsEnhancer } from "@redux-devtools/remote";
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "./session/sessionSlice";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    // Add your reducers here
  },
  enhancers: (defaultEnhancers) =>
    defaultEnhancers().concat(
      devToolsEnhancer({
        name: "CodeBuddy",
        realtime: true,
        hostname: "localhost",
        port: 8001,
      })
    ),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
