import { REDUX_REMOTE_PORT } from "@cb/constants/redux-dev-port";
import { getLocalStorage } from "@cb/services";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { configureStore } from "@reduxjs/toolkit";
import layoutReducer from "./slices/layoutSlice";

const user = getLocalStorage("test");

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
  },
  enhancers: (defaultEnhancers) =>
    defaultEnhancers().concat(
      devToolsEnhancer({
        name: user?.peer ?? "CodeBuddy Dev",
        realtime: true,
        hostname: "localhost",
        port:
          REDUX_REMOTE_PORT[user?.peer as keyof typeof REDUX_REMOTE_PORT] ??
          8000,
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
