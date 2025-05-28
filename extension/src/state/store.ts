import { devToolsEnhancer } from "@redux-devtools/remote";
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./session/counterSlice";
import sessionReducer from "./session/sessionSlice";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    counter: counterReducer,
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
console.log(store.getState());
// const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.connect({
//   name: "LeetCodeExtension",
// });
// console.log("Redux DevTools Extension", devTools);

// devTools?.init(store.getState()); // show initial state
// store.subscribe(() => devTools?.send("update", store.getState()));
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
