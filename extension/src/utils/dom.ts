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
