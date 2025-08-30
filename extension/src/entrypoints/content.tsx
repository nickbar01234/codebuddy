import { ContentScriptContext } from "#imports";
import { ContentScript } from "@cb/components/root/ContentScript";
import { DOM, URLS } from "@cb/constants";
import { getOrCreateControllers } from "@cb/services";
import { iframeService } from "@cb/services/iframe";
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

      // Create global iframe container for problemset
      const iframeContainer = document.createElement("div");
      iframeContainer.id = DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME_CONTAINER;
      iframeContainer.style.position = "absolute";
      iframeContainer.style.top = "-9999px";
      iframeContainer.style.left = "-9999px";
      iframeContainer.style.opacity = "0";
      iframeContainer.style.pointerEvents = "none";

      const iframe = document.createElement("iframe");
      iframe.src = URLS.PROBLEMSET;
      iframe.title = "LeetCode Question";
      iframe.id = DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME;
      iframe.className = "h-full w-full border-2 border-[#78788033]";
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      iframe.style.width = "100%";
      iframe.style.height = "100%";

      iframeContainer.appendChild(iframe);
      document.body.appendChild(iframeContainer);

      iframeService.setIframeElement(iframe);

      createRoot(extensionRoot).render(
        <ContentScript leetCodeNode={leetCodeNode} />
      );
    },
    onMount: () => {},
  });
};
