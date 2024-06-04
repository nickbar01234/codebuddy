export const waitForElement = (selector, timeout) => {
    return new Promise((resolve, reject) => {
        const node = document.querySelector(selector);
        if (node != null) {
            return resolve(node);
        }
        const observer = new MutationObserver((_mutations) => {
            const node = document.querySelector(selector);
            if (node != null) {
                observer.disconnect();
                resolve(node);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        setTimeout(() => {
            if (document.querySelector(selector) == null) {
                observer.disconnect();
                reject(`Unable to locate ${selector} within ${timeout}ms`);
            }
        }, timeout);
    });
};
