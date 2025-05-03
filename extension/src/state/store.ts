import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "./session/sessionSlice";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    // Add your reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});
const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.connect({
  name: "LeetCodeExtension",
});
console.log("Redux DevTools Extension", devTools);

devTools?.init(store.getState()); // show initial state
store.subscribe(() => devTools?.send("update", store.getState()));
// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
