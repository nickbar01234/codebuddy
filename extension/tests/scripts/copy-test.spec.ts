import { expect } from "../fixture";
import { multiUserRoomTest } from "../setup/room";

async function getCodeFromEditor(page: any): Promise<string> {
  return await page.evaluate(() => {
    const leetCodeEditor = (window as any).monaco.editor
      .getEditors()
      .find((editor: any) => {
        const containerId = editor.getContainerDomNode()?.id;
        return (
          containerId !== "codebuddy-editor" &&
          editor.getModel()?.getLanguageId() !== "plaintext"
        );
      });

    return leetCodeEditor?.getModel()?.getValue() ?? "";
  });
}

multiUserRoomTest(
  "User1 can copy code from User2",
  async ({ user1, user2 }) => {
    await user2.page.getByRole("button", { name: "C++" }).click();
    await user2.page.getByText("Python", { exact: true }).click();
    // wait for 2 seconds to ensure the code is loaded
    await user2.page.waitForTimeout(2000);

    const user2Code = await getCodeFromEditor(user2.page);
    await user1.page.getByRole("tab", { name: /Code/i }).click();
    await user1.page.locator(".lucide.lucide-eye").click();
    await user1.page.locator(".lucide.lucide-copy").first().click();

    // wait for 5 seconds to ensure the clipboard is updated
    await user1.page.waitForTimeout(5000);

    const copiedCode = await user1.page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    expect(copiedCode.trim()).toBe(user2Code.trim());
  }
);
