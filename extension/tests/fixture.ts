import { test as base, type BrowserContext } from "@playwright/test";
import {
  createExtensionContext,
  getExtensionId,
  setupPage,
} from "./utils/page";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await createExtensionContext();
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);
    await use(extensionId);
  },
  page: async ({ page }, use) => {
    await setupPage(page);
    await use(page);
  },
});

export const expect = test.expect;
