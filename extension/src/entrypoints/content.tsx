import { ContentScriptContext } from "#imports";
import { IframeContainer } from "@cb/components/iframe/IframeContainer";
import { ContentScript } from "@cb/components/root/ContentScript";
import { DOM, URLS } from "@cb/constants";
import { getOrCreateControllers } from "@cb/services";
import "@cb/style/index.css";
import { createRoot } from "react-dom/client";

export default defineContentScript({
  matches: [URLS.ALL_PROBLEMS],
  runAt: "document_end",
  async main(ctx) {
    // Initialize controllers on startup
    getOrCreateControllers();
    await injectScript("/proxy.js", { keepInDom: true });
    injectTestCaseMinusOne();
    const ui = createUi(ctx);
    ui.mount();
  },
});

const createUi = (ctx: ContentScriptContext) => {
  return createIntegratedUi(ctx, {
    position: "inline",
    anchor: DOM.LEETCODE_ROOT_ID,
    append: (leetCodeNode, extensionRoot) => {
      leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
      extensionRoot.classList.add("relative", "h-full", "w-full");

      const leetCodeRoot = document.createElement("div");
      leetCodeRoot.appendChild(leetCodeNode);

      createRoot(extensionRoot).render(
        <>
          <IframeContainer />
          <ContentScript leetCodeNode={leetCodeNode} />
        </>
      );
    },
    onMount: () => {},
  });
};

function injectTestCaseMinusOne() {
  // const TEST_CASE_TABBER_ID = 'testcase_tabbar_outer';
  // const testCaseParent = document.getElementById(TEST_CASE_TABBER_ID);
  // if (!testCaseParent) {
  //   console.warn('Test case parent node not found');
  //   return;
  // }
  // console.log('testCaseParent:', testCaseParent);

  const allTestCaseButtons = document.querySelectorAll(
    '[data-e2e-locator="console-testcase-tag"]'
  );
  if (!allTestCaseButtons) {
    console.warn("Test case button to clone not found");
    return;
  }

  const testCaseButton = allTestCaseButtons[allTestCaseButtons.length - 1];

  const testCaseParent = testCaseButton.parentElement;
  if (!testCaseParent) {
    console.warn("Test case button parent not found");
    return;
  }

  // Clone the button and update its label
  const newButton = testCaseButton.cloneNode(true);
  if (newButton instanceof HTMLElement) {
    newButton.textContent = "Case -1";
    newButton.classList.add("testcase-minus-one");
    newButton.addEventListener("click", (event) => {
      // Your logic here
      console.log("Case -1 button clicked");
      newButton.className =
        "font-big items-center whitespace-nowrap focus:outline-none inline-flex bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 hover:text-label-1 dark:hover:text-dark-label-1 text-label-1 dark:text-dark-label-1";
    });
    testCaseButton.insertAdjacentElement("afterend", newButton);
  }
}
