export const waitForElement = (
  selector: string,
  timeout: number = 3000,
  context: Document | ShadowRoot | Element = document
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
    (node as HTMLElement).style.display = "block";
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

export const generateId = (suffix: string) => {
  return `CodeBuddy-${suffix}`;
};
