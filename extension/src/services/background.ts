import { ServiceRequest, Status } from "@types";

const handleCookieRequest = async (): Promise<Status> => {
  const maybeCookie = await chrome.cookies.get({
    name: "LEETCODE_SESSION",
    url: "https://leetcode.com/",
  });

  if (maybeCookie == null) {
    return { status: "UNAUTHENTICATED" };
  }

  const sessionBase64 = maybeCookie.value.split(".")[1]; // Leetcode uses . to separate base64
  const session = JSON.parse(atob(sessionBase64));
  return {
    status: "AUTHENTICATED",
    user: { id: session.identity, username: session.username },
  };
};

/**
 * TODO(nickbar01234) - Redesign authentication flow
 *
 * @docs https://stackoverflow.com/a/61056192
 */

console.dir(chrome);
chrome.runtime.onMessage.addListener(
  (request: ServiceRequest, _sender, sendResponse) => {
    console.debug("Receiving", request);

    switch (request.action) {
      case "cookie": {
        handleCookieRequest().then((res) => {
          sendResponse(res);
        });
        break;
      }

      default:
        console.error(`Unhandled request ${request}`);
        break;
    }

    return true;
  }
);
