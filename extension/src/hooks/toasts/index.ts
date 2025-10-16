import { useOnMount } from "@cb/hooks";
import { getOrCreateControllers } from "@cb/services";
import { Events, EventType } from "@cb/types";
import { assertUnreachable } from "@cb/utils/error";
import { toast } from "sonner";

const { emitter } = getOrCreateControllers();

export const useToast = () => {
  useOnMount(() => {
    const onRoomChange = (room: Events["room.changes"]) => {
      room.joined.forEach((peer) => toast.info(`${peer} joined room`));
      room.left.forEach((peer) => toast.info(`${peer} left room`));
    };
    emitter.on("room.changes", onRoomChange);
    return () => emitter.off("room.changes", onRoomChange);
  });

  useOnMount(() => {
    const onUserDisconnected = ({ user }: Events["rtc.user.disconnected"]) => {
      toast.info(`${user} left the room`);
    };
    emitter.on("rtc.user.disconnected", onUserDisconnected);
    return () => emitter.off("rtc.user.disconnected", onUserDisconnected);
  });

  useOnMount(() => {
    const onRtcMessageReceived = ({
      message,
    }: Events["rtc.receive.message"]) => {
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

        default:
          assertUnreachable(event);
      }
    };
    emitter.on("rtc.receive.message", onRtcMessageReceived);
    return () => emitter.off("rtc.receive.message", onRtcMessageReceived);
  });
};
