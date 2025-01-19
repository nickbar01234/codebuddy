import chokidar from "chokidar";
import puppeteer from "puppeteer";
import _ from "lodash";

const EXTENSION_PATH = "./dist/";

const EXTENSION_HOST = "https://leetcode.com/problems/";
const TARGET_QUESTION = "https://leetcode.com/problems/two-sum/";

const pages = [];
const peers = [
  {
    peer: "code",
    createRoom: true,
  },
  {
    peer: "buddy",
    createRoom: false,
  },
];

const setup = async () => {
  const createBrowser = async (peer, createRoom) => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        "--start-maximized",
      ],
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
    await page.evaluate((createRoom) => {
      if (createRoom) {
        window.postMessage({ action: "createRoom", roomId: "CODE_BUDDY_TEST" });
      } else {
        window.postMessage({ action: "joinRoom", roomId: "CODE_BUDDY_TEST" });
      }
    }, createRoom);
    return { browser, page };
  };
  for (const { peer, createRoom } of peers) {
    pages.push(await createBrowser(peer, createRoom));
  }
};

const reload = _.throttle(() => {
  console.log("Detected build");
  pages.forEach(async ({ browser, page }) => {
    try {
      await page.evaluate(() => {
        window.postMessage({ action: "reloadExtension" });
      });
      page.reload();
    } catch (e) {
      console.error(e);
    }
  });
}, 5000);

setup().then(() => {
  chokidar
    .watch(EXTENSION_PATH, { awaitWriteFinish: true })
    .on("change", reload);
});

// eslint-disable-next-line no-undef
process.on("SIGINT", () => {
  pages.forEach(({ browser }) => browser.close());
});
