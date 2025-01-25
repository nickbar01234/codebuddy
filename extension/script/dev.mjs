import chokidar from "chokidar";
import puppeteer from "puppeteer";
import _ from "lodash";

const EXTENSION_PATH = "./dist/";

const EXTENSION_HOST = "https://leetcode.com/problems/";
const TARGET_QUESTION = "https://leetcode.com/problems/two-sum/";

// eslint-disable-next-line no-undef
const NUM_USERS = process.env.USERS ?? 2;

const USERNAMES = ["code", "buddy", "dev", "mode"];
const PAGES = Array.from({ length: NUM_USERS });
const PEERS = Array.from({ length: NUM_USERS }).map((_, idx) => ({
  peer: USERNAMES[idx],
}));

const setup = async () => {
  const createBrowser = async (peer) => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        "--start-maximized",
      ],
      devtools: true,
    });
    const page = await browser.newPage();
    await page.goto(EXTENSION_HOST);
    await page.evaluate((peer) => {
      localStorage.setItem(
        "codebuddytest",
        JSON.stringify({
          peer: peer,
        })
      );
    }, peer);
    await page.goto(TARGET_QUESTION);
    return { browser, page };
  };

  const setupRoom = async (page, createRoom) => {
    await page.evaluate((createRoom) => {
      if (createRoom) {
        window.postMessage({ action: "createRoom", roomId: "CODE_BUDDY_TEST" });
      } else {
        window.postMessage({ action: "joinRoom", roomId: "CODE_BUDDY_TEST" });
      }
    }, createRoom);
  };

  const asyncBrowsers = PEERS.map(async ({ peer }, idx) => {
    PAGES[idx] = await createBrowser(peer);
  });
  await Promise.all(asyncBrowsers);

  // Waits for first person to create and setup room. Everyone else can join simultaneously
  await setupRoom(PAGES[0].page, true);
  await Promise.all(PAGES.slice(1).map(({ page }) => setupRoom(page, false)));
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
      .watch(EXTENSION_PATH, { awaitWriteFinish: true })
      .on("change", reload);
  })
  .catch((e) => console.error("Failed with", e));

// eslint-disable-next-line no-undef
process.on("SIGINT", () => {
  PAGES.forEach(({ browser }) => browser.close());
});
