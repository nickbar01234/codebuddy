import { getOrCreateControllers } from "@cb/services";
import { User } from "@cb/types";
import { getNormalizedUrl } from "@cb/utils";

const { emitter } = getOrCreateControllers();

export const useRunBuddyTest = () => {
  const runBuddyTest = (buddy: User, testCaseIndex: number) => {
    const url = getNormalizedUrl(window.location.href);
    emitter.emit("rtc.send.message", {
      to: buddy,
      message: {
        action: "request-run-test",
        url,
        testCaseIndex,
      },
    });
  };

  return { runBuddyTest };
};
