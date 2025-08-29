import { DOM } from "@cb/constants";
import { BackgroundProxy } from "@cb/services/background";
import { EventEmitter } from "@cb/services/events";
import { AppStatus, AppStore, RoomStore } from "@cb/store";
import {
  ContentRequest,
  Events,
  EventType,
  ResponseStatus,
  User,
  WindowMessage,
} from "@cb/types";
import { Unsubscribe } from "@cb/types/utils";
import {
  getCodePayload,
  getTestsPayload,
  getUrlPayload,
} from "@cb/utils/messages";
import { toast } from "sonner";

export class MessageDispatcher {
  private emitter: EventEmitter;

  private appStore: AppStore;

  private roomStore: RoomStore;

  private background: BackgroundProxy;

  private unsubscribers: Unsubscribe[];

  public constructor(
    emitter: EventEmitter,
    appStore: AppStore,
    roomStore: RoomStore,
    background: BackgroundProxy
  ) {
    this.emitter = emitter;
    this.appStore = appStore;
    this.roomStore = roomStore;
    this.unsubscribers = [];
    this.background = background;
    this.init();
  }

  private init() {
    poll({
      fn: () =>
        this.background.setupCodeBuddyEditor({ id: DOM.CODEBUDDY_EDITOR_ID }),
      until: (response) => response?.status === ResponseStatus.SUCCESS,
    });

    poll({
      fn: () => this.background.setupLeetCodeEditor({}),
      until: (response) => response?.status === ResponseStatus.SUCCESS,
    });

    this.unsubscribers.push(this.subscribeToCodeEditor());
    this.unsubscribers.push(this.subscribeToTestEditor());
    this.unsubscribers.push(this.subscribeToRtcOpen());
    this.unsubscribers.push(this.subscribeToRtcMessage());
    this.unsubscribers.push(this.subscribeToRoomChanges());
    this.unsubscribers.push(this.subscribeToRtcConnectionError());
    this.subscribeToSubmission();
    this.subscribeToBackground();
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

        case "navigate": {
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
    const unsubscribeFromRtcOpen = this.emitter.on(
      "rtc.open",
      ({ user }: Events["rtc.open"]) => {
        this.broadCastInformation(user);
      }
    );
    return () => unsubscribeFromRtcOpen();
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
        case "url": {
          this.roomStore.getState().actions.peers.update(from, {
            url: message.url,
          });
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

  private subscribeToBackground() {
    browser.runtime.onMessage.addListener((request: ContentRequest) => {
      const { action } = request;
      switch (action) {
        case "toggleUi": {
          this.appStore.getState().actions.toggleEnabledApp();
          break;
        }

        case "url": {
          this.broadCastInformation();
          break;
        }

        default:
          assertUnreachable(action);
      }
    });
  }
  private subscribeToRtcConnectionError() {
    const unsubscribeFromRtcConnectionError = this.emitter.on(
      "rtc.error.connection",
      ({ user }) => {
        toast.error(
          `Failed to connect to ${user}. Please leave the room and re-join`
        );
      }
    );
    return () => unsubscribeFromRtcConnectionError();
  }

  private async broadCastInformation(user?: User) {
    this.emitter.emit("rtc.send.message", {
      to: user,
      message: await getCodePayload({}),
    });
    this.emitter.emit("rtc.send.message", {
      to: user,
      message: getTestsPayload(),
    });
    this.emitter.emit("rtc.send.message", {
      to: user,
      message: getUrlPayload(window.location.href),
    });
  }
}
