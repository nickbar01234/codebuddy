import { twoUserExpect, twoUserTest } from "@tests/fixture/in-room";

const EXPECTED_CPP_CODE = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`;

twoUserTest("User1 can copy code from User2", async ({ user1, user2 }) => {
  await user1.page.getByRole("tab", { name: /Code/i }).click();
  await user1.page.getByTestId("toggle-code-visibility").click();
  await user1.page.getByTestId("copy-code").click({ timeout: 30_000 });

  await twoUserExpect(async () => {
    const copiedCode = await user1.page.evaluate(() =>
      navigator.clipboard.readText()
    );
    twoUserExpect(copiedCode.trim()).toBe(EXPECTED_CPP_CODE.trim());
  }).toPass();
});
