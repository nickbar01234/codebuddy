import { DOM } from "@cb/constants";
import { BackgroundProxy } from "@cb/services/background";
import { EventEmitter } from "@cb/services/events";
import { AppStatus, AppStore, RoomStore } from "@cb/store";
import { LeetCodeStore } from "@cb/store/leetCodeStore";
import {
  ContentRequest,
  Events,
  EventType,
  QuestionProgressStatus,
  ResponseStatus,
  User,
  WindowMessage,
} from "@cb/types";
import { Unsubscribe } from "@cb/types/utils";
import { getNormalizedUrl } from "@cb/utils";
import { getCodePayload, getTestsPayload } from "@cb/utils/messages";
import { toast } from "sonner";

export class MessageDispatcher {
  private emitter: EventEmitter;

  private appStore: AppStore;

  private roomStore: RoomStore;

  private leetcodeStore: LeetCodeStore;

  private background: BackgroundProxy;

  private unsubscribers: Unsubscribe[];

  public constructor(
    emitter: EventEmitter,
    appStore: AppStore,
    roomStore: RoomStore,
    leetCodeStore: LeetCodeStore,
    background: BackgroundProxy
  ) {
    this.emitter = emitter;
    this.appStore = appStore;
    this.roomStore = roomStore;
    this.leetcodeStore = leetCodeStore;
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
          const code = await getCodePayload(message.data.changes);
          this.roomStore.getState().actions.self.update({
            questions: {
              [code.url]: {
                code,
              },
            },
          });
          this.emitter.emit("rtc.send.message", {
            message: code,
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
    const observer = new MutationObserver(async () =>
      this.emitter.emit("rtc.send.message", {
        message: await this.getTestsPayload(),
      })
    );
    waitForElement(DOM.LEETCODE_TEST_ID)
      .then((editor) =>
        observer.observe(editor, {
          attributes: true,
          childList: true,
          subtree: true,
        })
      )
      .catch(() =>
        console.error("Unable to find test editor", DOM.LEETCODE_TEST_ID)
      );
    return () => observer.disconnect();
  }

  private subscribeToSubmission() {
    // todo(nickbar01234): On teardown, we need to revert the changes
    const sendSuccessSubmission = () => {
      if (this.appStore.getState().auth.status === AppStatus.AUTHENTICATED) {
        const url = getNormalizedUrl(window.location.href);
        this.roomStore.getState().actions.self.complete(url);
        this.emitter.emit("rtc.send.message", {
          message: {
            action: "event",
            event: EventType.SUBMIT_SUCCESS,
            user: this.appStore.getState().actions.getAuthUser().username,
            url,
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
            url: getNormalizedUrl(window.location.href),
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
          mockBtn.onclick = async function (event) {
            event.preventDefault();
            sendSuccessSubmission();
            return;
          };
        } else {
          button.onclick = async function (event) {
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
        this.requestProgress(getNormalizedUrl(window.location.href), user);
      }
    );
    return () => unsubscribeFromRtcOpen();
  }

  private subscribeToRtcMessage() {
    const onMessage = ({ from, message }: Events["rtc.receive.message"]) => {
      console.log("Received message", from, message.action);
      const { action } = message;
      switch (action) {
        case "code": {
          const { url, ...code } = message;
          this.roomStore.getState().actions.peers.update(from, {
            questions: {
              [url]: {
                code,
                status: QuestionProgressStatus.IN_PROGRESS,
              },
            },
          });
          break;
        }

        case "tests": {
          const { tests, url } = message;
          this.roomStore.getState().actions.peers.update(from, {
            questions: {
              [url]: {
                tests,
                status: QuestionProgressStatus.IN_PROGRESS,
              },
            },
          });
          break;
        }

        case "event": {
          const { url, event } = message;
          if (event === EventType.SUBMIT_SUCCESS) {
            this.roomStore.getState().actions.peers.update(from, {
              questions: {
                [url]: {
                  status: QuestionProgressStatus.COMPLETED,
                },
              },
            });
          }
          break;
        }

        case "request-progress": {
          this.sendProgress(from, message.url);
          this.roomStore.getState().actions.peers.update(from, {
            url: message.url,
          });
          break;
        }

        case "sent-progress": {
          const { url, tests, code } = message;
          this.roomStore.getState().actions.peers.update(from, {
            questions: {
              [url]: {
                code,
                tests,
              },
            },
            url,
          });
          break;
        }

        default:
          assertUnreachable(action);
      }
    };
    this.emitter.on("rtc.receive.message", onMessage);
    return () => this.emitter.off("rtc.receive.message", onMessage);
  }

  private subscribeToRoomChanges() {
    const onRoomChange = ({
      left,
      room: { questions, usernames },
    }: Events["room.changes"]) => {
      this.roomStore.getState().actions.peers.remove(left);
      this.roomStore.getState().actions.room.setRoom({ questions, usernames });
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
          const user = this.appStore.getState().actions.getMaybeAuthUser();
          const url = getNormalizedUrl(window.location.href);
          const questions = this.roomStore.getState().room?.questions ?? [];
          if (user == undefined) {
            return;
          }
          this.roomStore.getState().actions.self.update({
            url: getNormalizedUrl(window.location.href),
          });
          if (questions.some((question) => question.url === url)) {
            this.requestProgress(url);
          }
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

  private async requestProgress(url: string, user?: User) {
    this.emitter.emit("rtc.send.message", {
      to: user,
      message: {
        action: "request-progress",
        url,
      },
    });
  }

  private sendProgress(user: User, url: string) {
    const progress = this.roomStore.getState().self?.questions[url];
    if (progress != undefined) {
      this.emitter.emit("rtc.send.message", {
        to: user,
        message: {
          action: "sent-progress",
          code: progress.code,
          tests: progress.tests,
          url,
        },
      });
    }
  }

  private async getTestsPayload() {
    return getTestsPayload(
      await this.leetcodeStore.getState().actions.getVariables()
    );
  }
}
