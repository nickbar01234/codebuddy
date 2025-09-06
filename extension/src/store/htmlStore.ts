import { BoundStore } from "@cb/types";
import { createRef, MutableRefObject } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface HtmlState {
  contentProcessed: boolean;
  htmlElement: MutableRefObject<HTMLIFrameElement | null>;
}

interface HtmlActions {
  showHtmlAtContainer: (container: HTMLElement) => void;
  hideHtml: () => void;
  setContentProcessed: (processed: boolean) => void;
  getHtmlElement: () => HTMLIFrameElement | null;
  isContentProcessed: () => boolean;
  isHtmlLoaded: () => boolean;
}

export const useHtml = create<BoundStore<HtmlState, HtmlActions>>()(
  immer((set, get) => ({
    contentProcessed: false,
    htmlElement: createRef(),
    actions: {
      showHtmlAtContainer: (container: HTMLElement) => {
        const { htmlElement } = get();
        if (!htmlElement.current) return;
        const containerRect = container.getBoundingClientRect();

        // static styles
        htmlElement.current.className =
          "block fixed z-[1000] pointer-events-auto w-full h-full";
        // Runtime-calculated positions, doesn't work with Tailwind classes
        htmlElement.current.style.top = `${containerRect.top}px`;
        htmlElement.current.style.left = `${containerRect.left}px`;
        htmlElement.current.style.width = `${containerRect.width}px`;
        htmlElement.current.style.height = `${containerRect.height}px`;
      },
      hideHtml: () => {
        const { htmlElement } = get();
        if (!htmlElement.current) return;
        htmlElement.current.className =
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
      isContentProcessed: () => {
        return get().contentProcessed;
      },
      isHtmlLoaded: () =>
        get().htmlElement.current?.contentDocument?.readyState === "complete",
    },
  }))
);

export type HtmlStore = typeof useHtml;
