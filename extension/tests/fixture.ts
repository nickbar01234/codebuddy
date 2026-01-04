import { DOM } from "@cb/constants";
import {
  test as base,
  chromium,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import fs from "node:fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { signIn } from "./utils/auth";
import { createRoom, joinRoom, type RoomInfo } from "./utils/room";

const extension = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../dist/chrome-mv3-dev"
);

if (!fs.existsSync(extension)) {
  throw new Error(`Invalid path ${extension}`);
}

async function createExtensionContext(): Promise<BrowserContext> {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    channel: "chromium",
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
    permissions: ["clipboard-read", "clipboard-write", "local-network-access"],
  });
  return context;
}

async function getExtensionId(context: BrowserContext): Promise<string> {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker)
    serviceWorker = await context.waitForEvent("serviceworker");
  return serviceWorker.url().split("/")[2];
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await createExtensionContext();
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const extensionId = await getExtensionId(context);
    await use(extensionId);
  },
  page: async ({ page }, use) => {
    page.on("console", (msg) => {
      console.log("Received message from page", msg.text(), msg.type());
    });
    await page.goto("https://leetcode.com/problems/two-sum", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(DOM.LEETCODE_ROOT_ID, {
      state: "visible",
      timeout: 30_000,
    });
    await use(page);
  },
});

export interface User {
  page: Page;
  email: string;
  extensionId: string;
  context: BrowserContext;
}

export const twoUserRoomTest = test.extend<{
  room: RoomInfo;
  user1: User;
  user2: User;
}>({
  user1: async ({ context, extensionId }, use) => {
    const page = context.pages()[0] || (await context.newPage());
    const email = `user1-${Date.now()}@test.com`;

    await signIn(page, email);

    const user1: User = {
      email,
      page,
      context,
      extensionId,
    };

    await use(user1);
  },
  room: async ({ user1 }, use) => {
    const room = await createRoom(user1.page);
    await use(room);
  },
  user2: async ({ room }, use) => {
    const user2Context = await createExtensionContext();
    const user2Page = user2Context.pages()[0] || (await user2Context.newPage());
    const user2Email = `user2-${Date.now()}@test.com`;

    await signIn(user2Page, user2Email);
    await joinRoom(user2Page, room.id);

    const user2ExtensionId = await getExtensionId(user2Context);

    const user2: User = {
      email: user2Email,
      page: user2Page,
      context: user2Context,
      extensionId: user2ExtensionId,
    };

    await use(user2);
    await user2Context.close();
  },
});

export const expect = test.expect;
