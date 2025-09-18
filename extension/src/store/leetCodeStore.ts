import { DOM } from "@cb/constants";
import background, { BackgroundProxy } from "@cb/services/background";
import {
  BoundStore,
  ExtractMessage,
  MessagePayload,
  PeerMessage,
  ServiceResponse,
} from "@cb/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LeetCodeState {
  variables: string[];
  languageExtensions: ServiceResponse["getLanguageExtension"];
}
interface LeetCodeAction {
  getVariables: () => Promise<string[]>;
  getLanguageExtension: (id?: string) => string | undefined;
  getCodeFromEditor: () => MessagePayload<
    ExtractMessage<PeerMessage, "code">
  > | null;
}

const createLeetCodeStore = (background: BackgroundProxy) => {
  const leetCodeStore = create<BoundStore<LeetCodeState, LeetCodeAction>>()(
    immer((set, get) => ({
      variables: [],
      languageExtensions: [],
      problemMetadata: {},

      actions: {
        getCodeFromEditor: (): MessagePayload<
          ExtractMessage<PeerMessage, "code">
        > | null => {
          try {
            const selectors = [
              ".view-lines",
              ".monaco-editor",
              '[class*="monaco"]',
              DOM.LEETCODE_TEST_ID,
            ];

            let editorElement: HTMLElement | null = null;

            for (const selector of selectors) {
              editorElement = document.querySelector(selector) as HTMLElement;
              if (editorElement && editorElement.textContent?.trim()) {
                break;
              }
            }

            if (!editorElement) return null;

            const code = editorElement.textContent || "";
            if (!code.trim()) return null;

            const languageSelector = document.querySelector(
              'button[aria-haspopup="dialog"][class*="rounded"]'
            );
            const language =
              languageSelector?.textContent?.toLowerCase() || "javascript";

            return { language, changes: code, value: code };
          } catch (error) {
            console.error("Failed to extract code:", error);
            return null;
          }
        },
        getVariables: async () => {
          if (get().variables.length > 0) {
            return get().variables;
          }
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
          set((state) => {
            state.variables = variables;
          });
          return variables;
        },

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
