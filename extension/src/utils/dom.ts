import { DOM } from "@cb/constants";

export const waitForElement = (
  selector: string,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT,
  stopCondition?: (elements: NodeListOf<Element>) => Element | null
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const checkElement = (): Element | null => {
      if (stopCondition) {
        const elements = context.querySelectorAll(selector);
        return stopCondition(elements);
      } else {
        return context.querySelector(selector);
      }
    };

    const node = checkElement();
    if (node != null) {
      return resolve(node);
    }

    const observer = new MutationObserver(() => {
      const node = checkElement();
      if (node != null) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(node);
      }
    });

    observer.observe(context, {
      childList: true,
      subtree: true,
    });

    const timeoutId = setTimeout(() => {
      const node = checkElement();
      if (node == null) {
        observer.disconnect();
        reject(`Unable to locate ${selector} within ${timeout}ms`);
      }
    }, timeout);
  });
};
/**
 * Wait for element at specific index in NodeList
 */
export const waitForElementAtIndex = (
  selector: string,
  index: number,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT
): Promise<Element> => {
  return waitForElement(selector, context, timeout, (elements) =>
    elements.length > index && elements[index] ? elements[index] : null
  );
};

/**
 * Wait for element attribute to match value
 */
export const waitForAttribute = (
  element: Element,
  attribute: string,
  value: string,
  timeout: number = DOM.TIMEOUT
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (element.getAttribute(attribute) === value) {
      return resolve();
    }

    const observer = new MutationObserver(() => {
      if (element.getAttribute(attribute) === value) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve();
      }
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: [attribute],
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(
        `Attribute ${attribute} did not become ${value} within ${timeout}ms`
      );
    }, timeout);
  });
};

/**
 * Wait for elements matching selector with condition
 */
export const waitForElementsWithCondition = (
  selector: string,
  condition: (elements: NodeListOf<Element>) => boolean,
  context: Document | ShadowRoot | Element = document,
  timeout: number = DOM.TIMEOUT
): Promise<NodeListOf<Element>> => {
  return new Promise((resolve, reject) => {
    const checkElements = () => {
      const elements = context.querySelectorAll(selector);
      if (condition(elements)) {
        return elements;
      }
      return null;
    };

    const elements = checkElements();
    if (elements) return resolve(elements);

    const observer = new MutationObserver(() => {
      const elements = checkElements();
      if (elements) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(elements);
      }
    });

    observer.observe(context, {
      childList: true,
      subtree: true,
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(`Condition not met for selector ${selector} within ${timeout}ms`);
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
