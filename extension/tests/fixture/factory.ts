import { DOM } from "@cb/constants";
import { test as base, BrowserContext, chromium, Page } from "@playwright/test";
import { signIn } from "@tests/utils/auth";
import fs from "node:fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const extension = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../dist/chrome-mv3-dev"
);

if (!fs.existsSync(extension)) {
  throw new Error(`Invalid path ${extension}`);
}

export interface UserPage {
  page: Page;
  email: string;
  extensionId: string;
  context: BrowserContext;
}

interface PlayWrightPageFactory {
  instantiate: (email: string) => Promise<UserPage>;
}

const setupPage = async (page: Page) => {
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
};

export const factory = base.extend<{ pageCreator: PlayWrightPageFactory }>({
  // eslint-disable-next-line no-empty-pattern
  pageCreator: async ({}, use) => {
    let context: BrowserContext | undefined;
    const instantiate: PlayWrightPageFactory["instantiate"] = async (email) => {
      context = await chromium.launchPersistentContext("", {
        headless: false,
        channel: "chromium",
        args: [
          `--disable-extensions-except=${extension}`,
          `--load-extension=${extension}`,
        ],
        permissions: [
          "clipboard-read",
          "clipboard-write",
          "local-network-access",
        ],
      });

      let [serviceWorker] = context.serviceWorkers();
      if (!serviceWorker)
        serviceWorker = await context.waitForEvent("serviceworker");
      const extensionId = serviceWorker.url().split("/")[2];

      const page = context.pages()[0] ?? (await context.newPage());
      await setupPage(page);
      await signIn(page, email);

      return { page, context, email, extensionId };
    };

    await use({ instantiate });

    if (context != undefined) {
      context.close();
    }
  },
});
