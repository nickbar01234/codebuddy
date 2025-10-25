import { getOrCreateControllers } from "@cb/services";
import { User } from "@cb/types";
import { getNormalizedUrl } from "@cb/utils";
import { toast } from "sonner";

const { emitter } = getOrCreateControllers();

export const useRunBuddyTest = () => {
  const runBuddyTest = (buddy: User, testCaseIndex: number) => {
    const url = getNormalizedUrl(window.location.href);
    console.log(
      `Requesting ${buddy} to run test case ${testCaseIndex + 1} in useRunBuddyTest.ts`
    );
    emitter.emit("rtc.send.message", {
      to: buddy,
      message: {
        action: "request-run-test",
        url,
        testCaseIndex,
      },
    });

    toast.info(`Requesting ${buddy} to run test case ${testCaseIndex + 1}`);
  };

  return { runBuddyTest };
};
