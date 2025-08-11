import { DOM } from "@cb/constants";
import { sendServiceRequest } from "@cb/services";
import { RoomStore } from "@cb/store";
import { EventEmitter, Events, ResponseStatus, WindowMessage } from "@cb/types";
import { Unsubscribe } from "@cb/types/utils";
import { getCodePayload, getTestsPayload } from "@cb/utils/messages";
import { toast } from "sonner";

export class MessageDispatcher {
  private emitter: EventEmitter;

  private roomStore: RoomStore;

  private unsubscribers: Unsubscribe[];

  public constructor(emitter: EventEmitter, roomStore: RoomStore) {
    this.emitter = emitter;
    this.roomStore = roomStore;
    this.unsubscribers = [];
    this.init();
  }

  private init() {
    poll({
      fn: () =>
        sendServiceRequest({
          action: "setupCodeBuddyModel",
          id: DOM.CODEBUDDY_EDITOR_ID,
        }),
      until: (response) => response?.status === ResponseStatus.SUCCESS,
    });

    poll({
      fn: () => sendServiceRequest({ action: "setupLeetCodeModel" }),
      until: (response) => response?.status === ResponseStatus.SUCCESS,
    });

    this.unsubscribers.push(this.subscribeToCodeEditor());
    this.unsubscribers.push(this.subscribeToTestEditor());
    this.unsubscribers.push(this.subscribeToRtcOpen());
    this.unsubscribers.push(this.subscribeToRtcMessage());
    this.unsubscribers.push(this.subscribeToRoomChanges());
  }

  private subscribeToCodeEditor() {
    const onWindowMessage = async (message: MessageEvent<WindowMessage>) => {
      if (message.data.action == undefined) {
        return;
      }
      const action = message.data.action;
      switch (action) {
        case "leetCodeOnChange": {
          this.emitter.emit("rtc.send.message", {
            message: await getCodePayload(message.data.changes),
          });
          break;
        }
        default:
          assertUnreachable(action);
      }
    };
    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  }

  private subscribeToTestEditor() {
    const observer = new MutationObserver(() =>
      this.emitter.emit("rtc.send.message", {
        message: getTestsPayload(),
      })
    );
    waitForElement(DOM.LEETCODE_TEST_ID, DOM.TIMEOUT).then((editor) =>
      observer.observe(editor, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    );
    return () => observer.disconnect();
  }

  private subscribeToRtcOpen() {
    const exchangeInitialCode = async ({ user }: Events["rtc.open"]) => {
      this.emitter.emit("rtc.send.message", {
        to: user,
        message: await getCodePayload({}),
      });
      this.emitter.emit("rtc.send.message", {
        to: user,
        message: getTestsPayload(),
      });
    };
    this.emitter.on("rtc.open", exchangeInitialCode);
    return () => this.emitter.off("rtc.open", exchangeInitialCode);
  }

  private subscribeToRtcMessage() {
    const onMessage = ({ from, message }: Events["rtc.receive.message"]) => {
      console.log("Received message", from, message.action);
      switch (message.action) {
        case "code": {
          const { code, changes } = message;
          this.roomStore.getState().actions.updatePeer(from, {
            code: { code, changes, timestamp: getUnixTs() },
          });
          break;
        }
        case "tests": {
          this.roomStore.getState().actions.updatePeer(from, {
            tests: {
              tests: message.tests,
              timestamp: getUnixTs(),
            },
          });
          break;
        }
      }
    };
    this.emitter.on("rtc.receive.message", onMessage);
    return () => this.emitter.off("rtc.receive.message", onMessage);
  }

  private subscribeToRoomChanges() {
    const onRoomChange = (room: Events["room.changes"]) => {
      room.joined.forEach((peer) => toast.info(`${peer} joined room`));
      room.left.forEach((peer) => toast.info(`${peer} left room`));
      this.roomStore.getState().actions.removePeers(room.left);
    };
    this.emitter.on("room.changes", onRoomChange);
    return () => this.emitter.off("room.changes", onRoomChange);
  }
}
