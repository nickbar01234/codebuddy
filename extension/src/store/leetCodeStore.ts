import { DOM } from "@cb/constants";
import background, { BackgroundProxy } from "@cb/services/background";
import { BoundStore, ServiceResponse } from "@cb/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LeetCodeState {
  preferredLanguage?: string;
  languageExtensions: ServiceResponse["getLanguageExtension"];
}

interface LeetCodeAction {
  getVariables: () => Promise<string[]>;
  getLanguageExtension: (id?: string) => string | undefined;
  setPreferredLanguage: (language: string) => void;
}

const createLeetCodeStore = (background: BackgroundProxy) => {
  const leetCodeStore = create<BoundStore<LeetCodeState, LeetCodeAction>>()(
    immer((set, get) => ({
      languageExtensions: [],
      preferredLanguage: undefined,

      actions: {
        getVariables: async () => {
          const variables = await waitForElement(DOM.PROBLEM_ID)
            .then((node) => node as HTMLElement)
            .then((node) => {
              const input = node.innerText.match(/.*Input:(.*)\n/);
              if (input != null) {
                return Array.from(input[1].matchAll(/(\w+)\s=/g)).map(
                  (matched) => matched[1]
                );
              }
              throw new Error("Unable to determine test variables");
            })
            .catch((e) => {
              console.error(e);
              return [];
            });
          return variables;
        },

        getLanguageExtension: (id?: string) => {
          const extensions =
            get().languageExtensions.find((language) => language.id === id)
              ?.extensions ?? [];
          return extensions[0];
        },

        setPreferredLanguage: (language: string) =>
          set((state) => {
            state.preferredLanguage = language;
          }),
      },
    }))
  );

  // Immediately initialize
  leetCodeStore.getState().actions.getVariables();
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
