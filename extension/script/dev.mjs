import chokidar from "chokidar";
import puppeteer from "puppeteer";

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
    await page.evaluate(
      (peer, createRoom) => {
        localStorage.setItem(
          "codebuddytest",
          JSON.stringify({
            roomId: "CODE_BUDDY_TEST",
            createRoomOnMount: createRoom,
          })
        );
        localStorage.setItem(
          "codebuddyfakeUser",
          JSON.stringify({
            peer: peer,
          })
        );
      },
      peer,
      createRoom
    );
    await page.goto(TARGET_QUESTION);
    setTimeout(() => {
      page.evaluate(
        () => {
          localStorage.removeItem("codebuddytest");
        },
        peer,
        createRoom
      );
    }, 2000);

    return { browser, page };
  };
  for (const { peer, createRoom } of peers) {
    pages.push(await createBrowser(peer, createRoom));
  }
};

setup().then(() => {
  chokidar
    .watch(EXTENSION_PATH, { awaitWriteFinish: true })
    .on("change", () => {
      console.log("Detected build");
      // todo(nickbar1234): How to unpack extension again?

      pages.forEach(async ({ browser, page }) => {
        try {
          await page.waitForSelector("#codeBuddyReload", { visible: true });
          await page.click("#codeBuddyReload");

          setTimeout(() => {
            page.reload();
          }, 1000);
        } catch (e) {
          console.error(e);
          browser.close();
        }
      });
    });
});
