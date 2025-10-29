import background, { BackgroundProxy } from "@cb/services/background";
import { BoundStore, ServiceResponse } from "@cb/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LeetCodeState {
  languageExtensions: ServiceResponse["getLanguageExtension"];
}

interface LeetCodeAction {
  getLanguageExtension: (id?: string) => string | undefined;
}

const createLeetCodeStore = (background: BackgroundProxy) => {
  const leetCodeStore = create<BoundStore<LeetCodeState, LeetCodeAction>>()(
    immer((set, get) => ({
      languageExtensions: [],

      actions: {
        getLanguageExtension: (id?: string) => {
          const extensions =
            get().languageExtensions.find((language) => language.id === id)
              ?.extensions ?? [];
          return extensions[0];
        },
      },
    }))
  );

  // Immediately initialize
  poll({
    fn: () => background.getAllLanguageExtensions({}),
    until: (response) => response instanceof Array && response.length > 0,
  })
    .then((extensions) => {
      leetCodeStore.setState((state) => {
        state.languageExtensions = extensions;
      });
    })
    .catch(console.error);

  return leetCodeStore;
};

export const useLeetCode = createLeetCodeStore(background);

export type LeetCodeStore = typeof useLeetCode;
