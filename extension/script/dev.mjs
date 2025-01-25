import chokidar from "chokidar";
import puppeteer from "puppeteer";
import _ from "lodash";
import { b } from "framer-motion/client";

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
  // {
  //   peer: "observer",
  //   createRoom: false,
  // },
  // {
  //   peer: "dundun",
  //   createRoom: false,
  // },
];

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

  for (const { peer, createRoom } of peers) {
    createBrowser(peer).then(({ browser, page }) => {
      pages.push({ browser, page });
      page.evaluate(async (createRoom) => {
        if (createRoom) {
          window.postMessage({
            action: "createRoom",
            roomId: "CODE_BUDDY_TEST",
          });
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500));
          window.postMessage({ action: "joinRoom", roomId: "CODE_BUDDY_TEST" });
        }
      }, createRoom);
    });
  }
};

const reload = _.debounce(() => {
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
}, 2000);

setup().then(() => {
  chokidar
    .watch(EXTENSION_PATH, { awaitWriteFinish: true })
    .on("change", reload);
});

// eslint-disable-next-line no-undef
process.on("SIGINT", () => {
  pages.forEach(({ browser }) => browser.close());
});
