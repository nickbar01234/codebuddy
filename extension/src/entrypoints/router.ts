import { WindowMessage } from "@cb/types";
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";

export default defineUnlistedScript(() => {
  console.log("Inject router");
  window.addEventListener("message", (message: MessageEvent<WindowMessage>) => {
    if (message.data.action == undefined) {
      return;
    }
    const action = message.data.action;
    switch (action) {
      case "navigate": {
        const { url } = message.data;
        window.next?.router.push(url);
        break;
      }

      case "leetCodeOnChange":
      case "setCodeBuddyCode":
      case "appendTestCaseToLeetCode":
        break;

      default:
        assertUnreachable(action);
    }
  });
});
