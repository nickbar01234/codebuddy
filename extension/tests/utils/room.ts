import type { Page } from "@playwright/test";

export interface RoomInfo {
  id: string;
}

export async function createRoom(page: Page): Promise<RoomInfo> {
  await page.getByRole("button", { name: "Create Room" }).click();
  await page.getByRole("radio", { name: "Private" }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("img", { name: "Copy room ID" }).click();

  const roomId = await page.evaluate(() => navigator.clipboard.readText());

  return { id: roomId };
}

export async function joinRoom(page: Page, roomId: string): Promise<void> {
  await page.getByRole("button", { name: "Join room" }).click();
  await page.getByRole("textbox", { name: "Enter room ID" }).fill(roomId);
  await page.getByRole("button", { name: "Join" }).click();
}
