import { WindowMessage } from "@cb/types";
import { getNormalizedUrl, getQuestionIdFromUrl } from "@cb/utils";
import { expect, test } from "@tests/fixture";

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
    await page.waitForURL(
      (url) =>
        getQuestionIdFromUrl(url.href) === getQuestionIdFromUrl(navigateTo),
      // timeout should be substantially smaller than overall timeout for expect to allow retries
      { timeout: 500 }
    );
  }).toPass();
});
