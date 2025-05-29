import { DEV_PORT } from "@cb/constants/dev-port";
import { getLocalStorage } from "@cb/services";
import { devToolsEnhancer } from "@redux-devtools/remote";
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./session/counterSlice";

const user = getLocalStorage("test");

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  enhancers: (defaultEnhancers) =>
    defaultEnhancers().concat(
      devToolsEnhancer({
        name: user?.peer ?? "CodeBuddy Dev",
        realtime: true,
        hostname: "localhost",
        port:
          user?.peer && user?.peer in DEV_PORT
            ? DEV_PORT[user.peer as keyof typeof DEV_PORT]
            : 8000,
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
