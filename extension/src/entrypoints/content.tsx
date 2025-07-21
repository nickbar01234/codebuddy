import { ContentScriptContext } from "#imports";
import { ContentScript } from "@cb/components/root/ContentScript";
import "@cb/style/index.css";
import { createRoot } from "react-dom/client";

const LEETCODE_ROOT_ID = "#qd-content";

export default defineContentScript({
  matches: ["https://leetcode.com/problems/*"],
  runAt: "document_end",
  main(ctx) {
    const ui = createUi(ctx);
    ui.mount();
  },
});

const createUi = (ctx: ContentScriptContext) => {
  return createIntegratedUi(ctx, {
    position: "inline",
    anchor: LEETCODE_ROOT_ID,
    append: (leetCodeNode, extensionRoot) => {
      leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
      extensionRoot.classList.add("relative", "h-full", "w-full");

      const leetCodeRoot = document.createElement("div");
      leetCodeRoot.appendChild(leetCodeNode);

      createRoot(extensionRoot).render(
        <ContentScript leetCodeNode={leetCodeNode} />
      );
    },
    onMount: () => {},
  });
};
