import { DOM } from "@cb/constants";

export const waitForElements = (
  selector: string,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT,
  condition?: (elements: NodeListOf<Element>) => boolean
): Promise<NodeListOf<Element>> => {
  return new Promise((resolve, reject) => {
    const checkElements = (): NodeListOf<Element> | null => {
      const elements = context.querySelectorAll(selector);
      if (condition) {
        return condition(elements) ? elements : null;
      }
      return elements.length > 0 ? elements : null;
    };

    const elements = checkElements();
    if (elements != null) {
      return resolve(elements);
    }
    let timeoutId: ReturnType<typeof setTimeout> = undefined!;

    const observer = new MutationObserver(() => {
      const elements = checkElements();
      if (elements != null) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(elements);
      }
    });

    observer.observe(context, {
      childList: true,
      subtree: true,
    });

    timeoutId = setTimeout(() => {
      const elements = checkElements();
      if (elements == null) {
        observer.disconnect();
        reject(`Unable to locate ${selector} within ${timeout}ms`);
      } else {
        observer.disconnect();
        resolve(elements);
      }
    }, timeout);
  });
};

// Wait for a single element (first match)
export const waitForElement = (
  selector: string,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT
): Promise<Element> => {
  return waitForElements(selector, context, timeout).then(
    (elements) => elements[0]
  );
};

// Wait for element at specific index
export const waitForElementAtIndex = (
  selector: string,
  index: number,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT
): Promise<Element> => {
  return waitForElements(
    selector,
    context,
    timeout,
    (elements) => elements.length > index && elements[index] != null
  ).then((elements) => elements[index]);
};

// Wait for elements matching selector with condition
export const waitForElementsWithCondition = (
  selector: string,
  condition: (elements: NodeListOf<Element>) => boolean,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT
): Promise<NodeListOf<Element>> => {
  return waitForElements(selector, context, timeout, condition);
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
    setImportant(htmlElement, "max-width", "none");
    setImportant(htmlElement, "padding", "0px");
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
