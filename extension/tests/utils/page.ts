import { DOM } from "@cb/constants";
import { chromium, type BrowserContext, type Page } from "@playwright/test";
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

export function getExtensionPath(): string {
  return extension;
}

export async function createExtensionContext(): Promise<BrowserContext> {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    channel: "chromium",
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
    permissions: ["clipboard-read", "clipboard-write", "local-network-access"],
  });
  return context;
}

export async function getExtensionId(context: BrowserContext): Promise<string> {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker)
    serviceWorker = await context.waitForEvent("serviceworker");
  return serviceWorker.url().split("/")[2];
}

export async function setupPage(page: Page): Promise<void> {
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
}
