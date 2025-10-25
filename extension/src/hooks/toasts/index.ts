import { useOnMount } from "@cb/hooks";
import { getOrCreateControllers } from "@cb/services";
import { EventType } from "@cb/types";
import { toast } from "sonner";

const { emitter } = getOrCreateControllers();

export const useToast = () => {
  useOnMount(() => {
    const unsubscribe = emitter.on("room.changes", (room) => {
      room.joined.forEach((peer) => toast.info(`${peer} joined room`));
      room.left.forEach((peer) => toast.info(`${peer} left room`));
    });
    return () => unsubscribe();
  });

  useOnMount(() => {
    const unsubscribe = emitter.on("rtc.receive.message", ({ message }) => {
      if (message.action !== "event") {
        return;
      }
      const { event, user } = message;
      switch (event) {
        case EventType.SUBMIT_SUCCESS: {
          toast.info(`${user} passed all test cases`);
          break;
        }

        case EventType.SUBMIT_FAILURE: {
          toast.info(`${user} failed some test cases`);
          break;
        }

        case EventType.ADD_QUESTION: {
          toast.info(`${user} added ${message.question} to queue`);
          break;
        }

        case EventType.RUN_TEST_CASES: {
          toast.info(`${user} is running test cases`);
          break;
        }

        default:
          assertUnreachable(event);
      }
    });
    return () => unsubscribe();
  });
};
