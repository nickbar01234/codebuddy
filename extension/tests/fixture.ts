import { DOM } from "@cb/constants";
import { test as base, chromium, type BrowserContext } from "@playwright/test";
import fs from "node:fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const extension = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../dist/chrome-mv3-dev"
);

if (!fs.existsSync(extension)) {
  throw new Error(`Invalid path ${extension}`);
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      channel: "chromium",
      args: [
        `--disable-extensions-except=${extension}`,
        `--load-extension=${extension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker)
      serviceWorker = await context.waitForEvent("serviceworker");

    const extensionId = serviceWorker.url().split("/")[2];
    await use(extensionId);
  },
  page: async ({ page }, use) => {
    page.on("console", (msg) => {
      console.log("Received message from page", msg.text(), msg.type());
    });
    await page.goto("https://leetcode.com/problems/two-sum", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(DOM.LEETCODE_ROOT_ID, {
      state: "visible",
      timeout: 30_000,
    });
    await use(page);
  },
});

export const expect = test.expect;
