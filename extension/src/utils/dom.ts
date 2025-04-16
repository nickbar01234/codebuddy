export const waitForElement = (
  selector: string,
  timeout: number = 3000,
  context: Document | ShadowRoot = document
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const node = context.querySelector(selector);
    if (node != null) {
      return resolve(node);
    }

    const observer = new MutationObserver((_mutations) => {
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
export const hideToRoot = (element: Element | undefined) => {
  let node = element?.parentElement?.parentElement;
  while (node != null) {
    node.style.display = "block";
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

export const waitForStableElements = async (
  selector: string,
  {
    timeout = 3000,
    interval = 200,
    minCount = 0,
    stableDuration = 500,
    root = document,
  }: {
    timeout?: number;
    interval?: number;
    minCount?: number;
    stableDuration?: number;
    root?: ParentNode;
  } = {}
): Promise<Element[]> => {
  let lastCount = 0;
  let stableTime = 0;

  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const elements = Array.from(root.querySelectorAll(selector));
      const currentCount = elements.length;

      if (currentCount >= minCount && currentCount === lastCount) {
        stableTime += interval;
        if (stableTime >= stableDuration) return resolve(elements);
      } else {
        lastCount = currentCount;
        stableTime = 0;
      }

      if (Date.now() - start > timeout) {
        console.warn(
          `Timed out waiting for stable elements of selector "${selector}"`
        );
        return resolve(elements);
      }

      setTimeout(check, interval);
    };

    check();
  });
};
