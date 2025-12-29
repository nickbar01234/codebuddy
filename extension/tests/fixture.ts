import { test as base, chromium, type BrowserContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const extension = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../dist/chrome-mv3"
);

console.log("import.meta.url:", import.meta.url);
console.log("cwd:", process.cwd());
console.log("extension path:", extension);

if (!fs.existsSync(extension)) {
  console.log("Extension folder does not exist. Listing parent dir:");
  console.log(
    fs
      .readdirSync(path.dirname(extension), { withFileTypes: true })
      .map((d) => d.name)
  );
  throw new Error(`Extension path missing on CI: ${extension}`);
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
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
    await page.goto("https://leetcode.com/problems/two-sum", {
      waitUntil: "domcontentloaded",
    });
    use(page);
  },
});

export const expect = test.expect;
