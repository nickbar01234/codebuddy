import { ExtractMessage, MessagePayload, WindowMessage } from "@cb/types";

const postMessage = (args: WindowMessage) => window.postMessage(args);

export const windowMessager = {
  navigate: ({
    url,
  }: MessagePayload<ExtractMessage<WindowMessage, "navigate">>) => {
    const problem = new URL(url);
    postMessage({ action: "navigate", url: problem.pathname });
  },
};
