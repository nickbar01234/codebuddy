import { DOM } from "@cb/constants";

export const waitForElement = (
  selector: string,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const node = context.querySelector(selector);
    if (node != null) {
      return resolve(node);
    }

    const observer = new MutationObserver(() => {
      const node = context.querySelector(selector);
      if (node != null) {
        observer.disconnect();
        resolve(node);
      }
    });

    observer.observe(context, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      if (context.querySelector(selector) == null) {
        observer.disconnect();
        reject(`Unable to locate ${selector} within ${timeout}ms`);
      }
    }, timeout);
  });
};

/**
 * Hide all dom elements that does not contain {@param element} in its subtree up to root
 */
export const hideToRoot = (element: Element | undefined | null) => {
  let node = element;
  while (node != null) {
    const htmlElement = node as HTMLElement;
    setImportant(htmlElement, "display", "block");
    setImportant(htmlElement, "margin", "0px");
    setImportant(htmlElement, "width", "100%");
    const parent = node.parentElement;
    Array.from(parent?.children ?? []).forEach((sibling) => {
      if (sibling !== node) {
        (sibling as HTMLElement).style.display = "none";
      }
    });
    node = parent;
  }
};

export const disablePointerEvents = (context: Document = document) => {
  const style = context.createElement("style");
  style.textContent = "a { pointer-events: none; }";
  context.head.appendChild(style);
};

export const appendClassIdempotent = (element: Element, tokens: string[]) =>
  tokens
    .filter((token) => !element.classList.contains(token))
    .forEach((token) => element.classList.add(token));

export const setImportant = (
  element: HTMLElement,
  key: string,
  value: string
) => element.style.setProperty(key, value, "important");
