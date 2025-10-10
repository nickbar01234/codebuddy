import { ContentScriptContext } from "#imports";
import { CodeBuddyMonacoPortal } from "@cb/components/portals/CodeBuddyMonacoPortal";
import { IFramePortal } from "@cb/components/portals/IFramePortal";
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

    ctx.addEventListener(window, "wxt:locationchange", () =>
      mountExtensionIdempotent(ctx)
    );

    mountExtensionIdempotent(ctx);
  },
});

const mountExtensionIdempotent = (ctx: ContentScriptContext) => {
  if (document.querySelector(`#${DOM.CODEBUDDY_EXTENSION_ID}`) == null) {
    waitForElement(DOM.LEETCODE_ROOT_ID).then(() => {
      const ui = createUi(ctx);
      ui.mount();
    });
  }
};

const createUi = (ctx: ContentScriptContext) => {
  return createIntegratedUi(ctx, {
    position: "inline",
    anchor: DOM.LEETCODE_ROOT_ID,
    append: (leetCodeNode, extensionRoot) => {
      leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
      extensionRoot.classList.add("relative", "h-full", "w-full");

      const leetCodeRoot = document.createElement("div");
      leetCodeRoot.appendChild(leetCodeNode);
      extensionRoot.id = DOM.CODEBUDDY_EXTENSION_ID;

      createRoot(extensionRoot).render(
        <>
          <IFramePortal />
          <CodeBuddyMonacoPortal />
          <ContentScript leetCodeNode={leetCodeNode} />
        </>
      );
    },
    onMount: () => {},
  });
};
