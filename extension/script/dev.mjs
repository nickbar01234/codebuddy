/* eslint-disable */

import chokidar from "chokidar";
import _ from "lodash";
import puppeteer from "puppeteer";

const EXTENSION_PATH = "./dist/";

const TARGET_QUESTION = "https://leetcode.com/problems/two-sum/";

// eslint-disable-next-line no-undef
const NUM_USERS = process.env.USERS ?? 2;

const USERNAMES = [
  "code@gmail.com",
  "buddy@hotmail.com",
  "dev@outlook.com",
  "mode@yahoo.com",
];
const PAGES = Array.from({ length: NUM_USERS });
const PEERS = Array.from({ length: NUM_USERS }).map((_, idx) => ({
  peer: USERNAMES[idx],
}));
const ROOM_ID = `CODE_BUDDY_TEST_${Date.now()}`;

// Keep in sync with package.json / vite.config.ts
const DEV_SCRIPT_HINT = ["content_script", "service_worker"].map(
  (file) => `${EXTENSION_PATH}/${file}`
);

const setup = async () => {
  const createBrowser = async (peer) => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        "--start-maximized",
        // todo(nickbar01234): Figure out nginx and ngrok so that cors doesn't break
        "--disable-web-security",
      ],
      devtools: true,
    });

    const page = await browser.newPage();
    // Enable browser dev-mode for extensions.
    await page.goto("chrome://extensions");
    const devModeToggle = await page.evaluateHandle(() =>
      document
        .querySelector("body > extensions-manager")
        .shadowRoot.querySelector("extensions-toolbar")
        .shadowRoot.querySelector("#devMode")
    );
    await devModeToggle.click();
    await page.goto(TARGET_QUESTION);
    await page.evaluate(
      (peer, roomId) => {
        localStorage.setItem(
          "codebuddytest",
          JSON.stringify({
            peer: peer,
            roomId: roomId,
          })
        );
      },
      peer,
      NUM_USERS > 1 ? ROOM_ID : undefined
    );
    await page.evaluate(() => {
      const mockSubmit = (type) => {
        window.postMessage({action: type === "success" ? "submitSuccess" : "submitFail"})
      }
      setTimeout(() => mockSubmit("success"), 3000)
    })
    return { browser, page };
  };
  const asyncBrowsers = PEERS.map(async ({ peer }, idx) => {
    PAGES[idx] = await createBrowser(peer);
  });
  await Promise.all(asyncBrowsers);
};

const reload = _.debounce(() => {
  console.log("Detected build");
  PAGES.forEach(async ({ page }) => {
    try {
      await page.evaluate(() => {
        window.postMessage({ action: "reloadExtension" });
      });
      page.reload();
    } catch (e) {
      console.error(e);
    }
  });
}, 2000);

setup()
  .then(() => {
    chokidar
      .watch(DEV_SCRIPT_HINT, { awaitWriteFinish: true })
      .on("add", reload);
  })
  .catch((e) => console.error("Failed with", e));

// eslint-disable-next-line no-undef
process.on("SIGINT", () => {
  PAGES.forEach(({ browser }) => browser.close());
});
