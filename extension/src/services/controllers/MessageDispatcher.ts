import { DOM } from "@cb/constants";
import { AppStatus, AppStore, RoomStore } from "@cb/store";
import { EventEmitter, Events, EventType, WindowMessage } from "@cb/types";
import { Unsubscribe } from "@cb/types/utils";
import { getCodePayload, getTestsPayload } from "@cb/utils/messages";

export class MessageDispatcher {
  private emitter: EventEmitter;

  private appStore: AppStore;

  private roomStore: RoomStore;

  private unsubscribers: Unsubscribe[];

  public constructor(
    emitter: EventEmitter,
    appStore: AppStore,
    roomStore: RoomStore
  ) {
    this.emitter = emitter;
    this.appStore = appStore;
    this.roomStore = roomStore;
    this.unsubscribers = [];
    this.init();
  }

  private init() {
    this.unsubscribers.push(this.subscribeToCodeEditor());
    this.unsubscribers.push(this.subscribeToTestEditor());
    this.unsubscribers.push(this.subscribeToRtcOpen());
    this.unsubscribers.push(this.subscribeToRtcMessage());
    this.unsubscribers.push(this.subscribeToRoomChanges());
    this.subscribeToSubmission();
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
    waitForElement(DOM.LEETCODE_TEST_ID).then((editor) =>
      observer.observe(editor, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    );
    return () => observer.disconnect();
  }

  private subscribeToSubmission() {
    // todo(nickbar01234): On teardown, we need to revert the changes
    const sendSuccessSubmission = () => {
      if (this.appStore.getState().auth.status === AppStatus.AUTHENTICATED) {
        this.emitter.emit("rtc.send.message", {
          message: {
            action: "event",
            event: EventType.SUBMIT_SUCCESS,
            user: this.appStore.getState().actions.getAuthUser().username,
            timestamp: getUnixTs(),
          },
        });
      }
    };

    const sendFailedSubmission = () => {
      if (this.appStore.getState().auth.status === AppStatus.AUTHENTICATED) {
        this.emitter.emit("rtc.send.message", {
          message: {
            action: "event",
            event: EventType.SUBMIT_FAILURE,
            user: this.appStore.getState().actions.getAuthUser().username,
            timestamp: getUnixTs(),
          },
        });
      }
    };

    waitForElement(DOM.LEETCODE_SUBMIT_BUTTON)
      .then((button) => button as HTMLButtonElement)
      .then((button) => {
        const onclick = button.onclick;
        if (import.meta.env.MODE === "development") {
          const mockBtn = button.cloneNode(true) as HTMLButtonElement;
          button.replaceWith(mockBtn);
          mockBtn.onclick = function (event) {
            event.preventDefault();
            sendSuccessSubmission();
            return;
          };
        } else {
          button.onclick = function (event) {
            if (onclick) onclick.call(this, event);
            waitForElement(DOM.LEETCODE_SUBMISSION_RESULT)
              .then(sendSuccessSubmission.bind(this))
              .catch(sendFailedSubmission.bind(this));
          };
        }
      });
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
          const { value, changes, language } = message;
          this.roomStore.getState().actions.peers.update(from, {
            code: { value, changes, language },
          });
          break;
        }
        case "tests": {
          this.roomStore.getState().actions.peers.update(from, {
            tests: {
              tests: message.tests,
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
      this.roomStore.getState().actions.peers.remove(room.left);
    };
    this.emitter.on("room.changes", onRoomChange);
    return () => this.emitter.off("room.changes", onRoomChange);
  }
}
