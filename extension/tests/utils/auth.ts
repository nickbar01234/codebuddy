import type { Page } from "@playwright/test";

export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto("https://leetcode.com/problems/two-sum", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("textbox", { name: "Enter your email" }).fill(email);
  await page.getByRole("button", { name: "Continue" }).click();
}
