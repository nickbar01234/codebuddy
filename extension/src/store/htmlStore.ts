import { BoundStore } from "@cb/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface HtmlState {
  contentProcessed: boolean;
  isVisible: boolean;
}

interface HtmlActions {
  initialize: (html: HTMLIFrameElement, container: HTMLElement) => void;
  showHtmlAtContainer: (container: HTMLElement) => void;
  hideHtml: () => void;
  setContentProcessed: (processed: boolean) => void;
  getHtmlElement: () => HTMLIFrameElement | null;
  isHtmlInHiddenContainer: () => boolean;
  isContentProcessed: () => boolean;
  isHtmlLoaded: () => boolean;
  isHtmlVisible: () => boolean;
}

let htmlElement: HTMLIFrameElement | null = null;
let hiddenContainer: HTMLElement | null = null;

export const useHtml = create<BoundStore<HtmlState, HtmlActions>>()(
  immer((set, get) => ({
    contentProcessed: false,
    isVisible: false,
    actions: {
      initialize: (html: HTMLIFrameElement, container: HTMLElement) => {
        htmlElement = html;
        hiddenContainer = container;
      },
      showHtmlAtContainer: (container: HTMLElement) => {
        if (!hiddenContainer || !htmlElement) return;

        const containerRect = container.getBoundingClientRect();

        // static styles
        hiddenContainer.className = "block fixed z-[1000] pointer-events-auto";
        htmlElement.className = "w-full h-full block";

        // Runtime-calculated positions, doesn't work with Tailwind classes
        hiddenContainer.style.top = `${containerRect.top}px`;
        hiddenContainer.style.left = `${containerRect.left}px`;
        hiddenContainer.style.width = `${containerRect.width}px`;
        hiddenContainer.style.height = `${containerRect.height}px`;

        set((state) => {
          state.isVisible = true;
        });
      },
      hideHtml: () => {
        if (!hiddenContainer) return;

        hiddenContainer.className = "hidden pointer-events-none fixed z-[1000]";

        set((state) => {
          state.isVisible = false;
        });
      },
      setContentProcessed: (processed: boolean) => {
        set((state) => {
          state.contentProcessed = processed;
        });
      },
      getHtmlElement: () => {
        return htmlElement;
      },
      isHtmlInHiddenContainer: () => {
        if (!hiddenContainer || !htmlElement) return false;
        return hiddenContainer.contains(htmlElement);
      },
      isContentProcessed: () => {
        return get().contentProcessed;
      },
      isHtmlLoaded: () => {
        if (!htmlElement?.contentDocument) return false;
        return htmlElement.contentDocument.readyState === "complete";
      },
      isHtmlVisible: () => {
        return get().isVisible;
      },
    },
  }))
);

export type HtmlStore = typeof useHtml;
