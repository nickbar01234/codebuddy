import puppeteer from "puppeteer";
import chokidar from "chokidar";

const EXTENSION_PATH = "./dist/";

const EXTENSION_HOST = "https://leetcode.com/problems/";
const TARGET_QUESTION = "https://leetcode.com/problems/two-sum/";

const pages = [];

const setup = async () => {
  const createBrowser = async (peer, createRoom) => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });
    const page = await browser.newPage();
    await page.goto(EXTENSION_HOST);
    await page.evaluate(
      (peer, createRoom) => {
        localStorage.setItem(
          "codebuddytest",
          JSON.stringify({
            peer: peer,
            roomId: "CODE_BUDDY_TEST",
            createRoomOnMount: createRoom,
          })
        );
      },
      peer,
      createRoom
    );
    await page.goto(TARGET_QUESTION);
    return page;
  };
  pages.push(await createBrowser("code", true));
  pages.push(await createBrowser("buddy", false));
};

setup().then(() => {
  chokidar
    .watch(EXTENSION_PATH, { awaitWriteFinish: true })
    .on("change", () => {
      console.log("Detected build");
      // todo(nickbar1234): How to unpack extension again?
      pages.forEach((page) => page.reload());
    });
});
