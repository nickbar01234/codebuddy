import { BoundStore } from "@cb/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface HtmlState {
  contentProcessed: boolean;
  htmlElement: HTMLIFrameElement | null;
}

interface HtmlActions {
  showHtml: (container: HTMLElement) => void;
  hideHtml: () => void;
  blurHtml: () => void;
  unblurHtml: () => void;
  setContentProcessed: (processed: boolean) => void;
  setHtmlElement: (element: HTMLIFrameElement | null) => void;
  getHtmlElement: () => HTMLIFrameElement | null;
  isContentProcessed: () => boolean;
  isHtmlLoaded: () => boolean;
}

export const useHtml = create<BoundStore<HtmlState, HtmlActions>>()(
  immer((set, get) => ({
    contentProcessed: false,
    htmlElement: null,
    actions: {
      showHtml: (container) => {
        const { htmlElement } = get();
        if (!htmlElement) return;
        const containerRect = container.getBoundingClientRect();

        // static styles
        htmlElement.className =
          "block fixed z-[3000] pointer-events-auto w-full h-full transition";
        // Runtime-calculated positions, doesn't work with Tailwind classes
        htmlElement.style.top = `${containerRect.top}px`;
        htmlElement.style.left = `${containerRect.left}px`;
        htmlElement.style.width = `${containerRect.width}px`;
        htmlElement.style.height = `${containerRect.height}px`;
      },
      blurHtml: () => {
        const { htmlElement } = get();
        if (!htmlElement) return;
        appendClassIdempotent(htmlElement, ["blur-sm", "filter"]);
      },
      unblurHtml: () => {
        const { htmlElement } = get();
        if (!htmlElement) return;
        htmlElement.classList.remove("blur-sm", "filter");
      },
      hideHtml: () => {
        const { htmlElement } = get();
        if (!htmlElement) return;
        htmlElement.className = "hidden pointer-events-none fixed";
      },
      setContentProcessed: (processed: boolean) => {
        set((state) => {
          state.contentProcessed = processed;
        });
      },
      setHtmlElement: (element) => set({ htmlElement: element }),
      getHtmlElement: () => {
        return get().htmlElement;
      },
      isContentProcessed: () => {
        return get().contentProcessed;
      },
      isHtmlLoaded: () =>
        get().htmlElement?.contentDocument?.readyState === "complete",
    },
  }))
);

export type HtmlStore = typeof useHtml;
