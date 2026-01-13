import { test as base, BrowserContext, chromium, Page } from "@playwright/test";
import { signIn } from "@tests/utils/auth";
import { getExtensionId, getExtensionPath, setupPage } from "@tests/utils/page";

export interface UserPage {
  page: Page;
  email: string;
  extensionId: string;
  context: BrowserContext;
}

interface PlayWrightPageFactory {
  instantiate: (email: string) => Promise<UserPage>;
}
const extension = getExtensionPath();

export const factory = base.extend<{ pageCreator: PlayWrightPageFactory }>({
  // eslint-disable-next-line no-empty-pattern
  pageCreator: async ({}, use) => {
    const contexts: BrowserContext[] = [];
    const instantiate: PlayWrightPageFactory["instantiate"] = async (email) => {
      const context = await chromium.launchPersistentContext("", {
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
      contexts.push(context);

      const extensionId = await getExtensionId(context);
      const page = context.pages()[0] ?? (await context.newPage());
      await setupPage(page);
      await signIn(page, email);

      return { page, context, email, extensionId };
    };

    await use({ instantiate });

    await Promise.all(contexts.map((ctx) => ctx.close()));
  },
});
