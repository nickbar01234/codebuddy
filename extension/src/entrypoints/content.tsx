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
