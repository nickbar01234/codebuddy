import { WindowMessage } from "@cb/types";
import { getNormalizedUrl } from "@cb/utils";
import { expect, test } from "@tests/utils/page";

test("Navigate to different problem", async ({ page }) => {
  const navigateTo = "https://leetcode.com/problems/add-two-numbers";
  expect(getNormalizedUrl(page.url())).toMatch(
    "https://leetcode.com/problems/two-sum"
  );
  await expect(async () => {
    await page.evaluate((url) => {
      const navigate: WindowMessage = {
        action: "navigate",
        url,
      };
      window.postMessage(navigate);
    }, navigateTo);
    expect(getNormalizedUrl(page.url())).toBe(navigateTo);
  }).toPass();
});
