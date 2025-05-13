import chokidar from "chokidar";
import _ from "lodash";
import puppeteer, { Browser, Page } from "puppeteer";

interface PuppeteerBrowser {
  page: Page;
  browser: Browser;
}

const EXTENSION_PATH = "./dist/";

const TARGET_QUESTION = "https://leetcode.com/problems/two-sum/";

const NUM_USERS = parseInt(process.env.USERS ?? "") || 2;

const USERNAMES = [
  "code@gmail.com",
  "buddy@hotmail.com",
  "dev@outlook.com",
  "mode@yahoo.com",
];
const PAGES: PuppeteerBrowser[] = Array.from({ length: NUM_USERS });
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
    const devModeToggle = await page
      .goto("chrome://extensions")
      .then(() =>
        page.evaluateHandle(() =>
          document
            .querySelector("body > extensions-manager")
            ?.shadowRoot?.querySelector("extensions-toolbar")
            ?.shadowRoot?.querySelector("#devMode")
        )
      );
    /* eslint-disable */
    await (devModeToggle as any).click();
    /* eslint-enable */
    devModeToggle.dispose();
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

process.on("SIGINT", () => {
  PAGES.forEach(({ browser }) => browser.close());
});
