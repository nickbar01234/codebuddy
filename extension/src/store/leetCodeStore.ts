import { DOM } from "@cb/constants";
import background, { BackgroundProxy } from "@cb/services/background";
import {
  Code,
  getProblemMetaBySlugServer,
  ProblemMeta,
} from "@cb/services/graphql/metadata";
import { BoundStore, ServiceResponse } from "@cb/types";
import { toast } from "sonner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LeetCodeState {
  variables: string[];
  problemMetadata: Record<string, ProblemMeta | undefined>;
  languageExtensions: ServiceResponse["getLanguageExtension"];
}

interface LeetCodeAction {
  getVariables: () => Promise<string[]>;
  getLanguageExtension: (id?: string) => string | undefined;
  getProblemMetadata: (slugs: string[]) => LeetCodeState["problemMetadata"];
  fetchProblemMetadata: (slugs: string[]) => Promise<void>;
}

const createLeetCodeStore = (background: BackgroundProxy) => {
  const leetCodeStore = create<BoundStore<LeetCodeState, LeetCodeAction>>()(
    immer((set, get) => ({
      variables: [],
      languageExtensions: [],
      problemMetadata: {},

      actions: {
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

        getProblemMetadata: (slugs) =>
          slugs.reduce(
            (metadata, slug) => ({
              ...metadata,
              [slug]: get().problemMetadata[slug],
            }),
            {}
          ),

        fetchProblemMetadata: async (slugs) => {
          const responses = await Promise.all(
            slugs.map(getProblemMetaBySlugServer)
          );
          const failures = responses.filter(
            (response) => response.code !== Code.SUCCESS
          );
          if (failures.length > 0) {
            toast.error("Encountered exception when fetching problem metadata");
            console.error(failures);
          }
          set((state) => {
            responses
              .filter((response) => response.code === Code.SUCCESS)
              .forEach((response) => {
                state.problemMetadata[response.data.slug] = response.data;
              });
          });
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
