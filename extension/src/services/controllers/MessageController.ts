import { DOM } from "@cb/constants";
import { sendServiceRequest } from "@cb/services";
import { RoomStore } from "@cb/store";
import { EventEmitter, ResponseStatus } from "@cb/types";
import { Unsubscribe } from "@cb/types/utils";

export class MessageController {
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

    this.unsubscribers.push(this.subscribeToMonacoEditor());
  }

  private subscribeToMonacoEditor() {
    const onWindowMessage = (message: MessageEvent) => {
      console.log("Received message", message);
    };
    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  }
}
