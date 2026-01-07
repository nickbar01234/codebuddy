import { expect, test, twoUserRoomTest } from "@tests/fixture";

test("Content script is mounted", async ({ page }) => {
  await expect(page.getByText("CodeBuddy").first()).toBeVisible({
    timeout: 30_000,
  });
});

const EXPECTED_CPP_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`;

twoUserRoomTest("User1 can copy code from User2", async ({ user1, user2 }) => {
  await user1.page.getByRole("tab", { name: /Code/i }).click();
  await user1.page.getByTestId("toggle-code-visibility").click();
  await user1.page.getByTestId("copy-code").click();
  await expect(async () => {
    const copiedCode = await user1.page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(copiedCode.trim()).toBe(EXPECTED_CPP_CODE.trim());
  }).toPass();
});
