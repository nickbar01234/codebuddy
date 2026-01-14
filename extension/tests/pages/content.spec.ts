import { expect, test } from "@tests/fixture";

test("Content script is mounted", async ({ page }) => {
  await expect(page.getByText("CodeBuddy").first()).toBeVisible({
    timeout: 30_000,
  });
});
