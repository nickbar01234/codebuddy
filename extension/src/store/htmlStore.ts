import { BoundStore } from "@cb/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface HtmlState<T extends HTMLElement> {
  htmlElement: T | null;
}

interface HtmlActions<T extends HTMLElement> {
  showHtml: (container: HTMLElement, zIndex: number) => void;
  hideHtml: () => void;
  blurHtml: () => void;
  unblurHtml: () => void;
  setHtmlElement: (element: T | null) => void;
  getHtmlElement: () => T | null;
}

const createHtmlStore = <T extends HTMLElement>() => {
  return create<BoundStore<HtmlState<T>, HtmlActions<T>>>()(
    immer((set, get) => ({
      htmlElement: null,
      actions: {
        showHtml: (container, zIndex) => {
          const { htmlElement } = get();
          if (!htmlElement) return;
          const containerRect = container.getBoundingClientRect();

          // static styles
          htmlElement.className = `block fixed z-[${zIndex}] pointer-events-auto w-full h-full transition isolate`;
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
        setHtmlElement: (element) => set({ htmlElement: element }),
        getHtmlElement: () => {
          return get().htmlElement;
        },
      },
    }))
  );
};

export const useLeetCodeProblemsHtml = createHtmlStore<HTMLIFrameElement>();

export const useCodeBuddyMonacoHtml = createHtmlStore();

export type HtmlStore = ReturnType<typeof createHtmlStore>;
