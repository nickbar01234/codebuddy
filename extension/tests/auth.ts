import type { Page } from "@playwright/test";
import { test } from "./fixture";

export interface AuthenticatedUser {
  email: string;
  page: Page;
  context: any;
  extensionId: string;
}

async function signIn(page: Page, email: string): Promise<void> {
  await page.goto("https://leetcode.com/problems/two-sum", {
    waitUntil: "domcontentloaded",
  });
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill(email);
  const continueButton = page.getByRole("button", { name: "Continue" });
  await continueButton.click();
}

export const authenticatedTest = test.extend<{
  authenticatedUser: AuthenticatedUser;
}>({
  authenticatedUser: async ({ context, extensionId }, use) => {
    const page = context.pages()[0] || (await context.newPage());
    const email = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;

    await signIn(page, email);

    const user: AuthenticatedUser = {
      email,
      page,
      context,
      extensionId,
    };

    await use(user);
  },
});

export { signIn };
