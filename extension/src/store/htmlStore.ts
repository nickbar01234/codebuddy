import { BoundStore } from "@cb/types";
import { createRef, MutableRefObject } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface HtmlState {
  contentProcessed: boolean;
  hiddenContainer: MutableRefObject<HTMLDivElement | null>;
  htmlElement: MutableRefObject<HTMLIFrameElement | null>;
}

interface HtmlActions {
  showHtmlAtContainer: (container: HTMLElement) => void;
  hideHtml: () => void;
  setContentProcessed: (processed: boolean) => void;
  getHtmlElement: () => HTMLIFrameElement | null;
  isHtmlInHiddenContainer: () => boolean;
  isContentProcessed: () => boolean;
  isHtmlLoaded: () => boolean;
}

export const useHtml = create<BoundStore<HtmlState, HtmlActions>>()(
  immer((set, get) => ({
    contentProcessed: false,
    isVisible: false,
    hiddenContainer: createRef(),
    htmlElement: createRef(),
    actions: {
      showHtmlAtContainer: (container: HTMLElement) => {
        const { hiddenContainer, htmlElement } = get();
        if (!hiddenContainer.current || !htmlElement.current) return;
        const containerRect = container.getBoundingClientRect();

        // static styles
        hiddenContainer.current.className =
          "block fixed z-[1000] pointer-events-auto";
        htmlElement.current.className = "w-full h-full block";

        // Runtime-calculated positions, doesn't work with Tailwind classes
        hiddenContainer.current.style.top = `${containerRect.top}px`;
        hiddenContainer.current.style.left = `${containerRect.left}px`;
        hiddenContainer.current.style.width = `${containerRect.width}px`;
        hiddenContainer.current.style.height = `${containerRect.height}px`;
      },
      hideHtml: () => {
        const { hiddenContainer, htmlElement } = get();
        if (!hiddenContainer.current || !htmlElement.current) return;
        hiddenContainer.current.className =
          "hidden pointer-events-none fixed z-[1000]";
      },
      setContentProcessed: (processed: boolean) => {
        set((state) => {
          state.contentProcessed = processed;
        });
      },
      getHtmlElement: () => {
        return get().htmlElement.current;
      },
      isHtmlInHiddenContainer: () => {
        const { hiddenContainer, htmlElement } = get();
        if (!hiddenContainer.current || !htmlElement.current) return false;
        return hiddenContainer.current.contains(get().htmlElement.current);
      },
      isContentProcessed: () => {
        return get().contentProcessed;
      },
      isHtmlLoaded: () => {
        const { htmlElement } = get();
        if (!htmlElement.current?.contentDocument) return false;
        return htmlElement.current.contentDocument.readyState === "complete";
      },
    },
  }))
);

export type HtmlStore = typeof useHtml;
