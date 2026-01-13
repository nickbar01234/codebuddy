import { WEB_RTC_ICE_SERVERS } from "@cb/constants";
import { AppStore, RoomStore, useApp, useRoom } from "@cb/store";
import { DatabaseService } from "@cb/types";
import background, { BackgroundProxy } from "./background";
import { MessageDispatcher } from "./controllers/MessageDispatcher";
import { RoomController } from "./controllers/RoomController";
import { WebRtcController } from "./controllers/WebRtcController";
import db from "./db";
import { emitter, EventEmitter } from "./events";
export {
  clearLocalStorage,
  clearLocalStorageForRoom,
  getLocalStorage,
  getSessionStorage,
  removeLocalStorage,
  removeSessionStorage,
  setLocalStorage,
  setSessionStorage,
} from "@cb/utils/storage";

interface Controllers {
  emitter: EventEmitter;
  webrtc: WebRtcController;
  room: RoomController;
  message: MessageDispatcher;
}

const createControllersFactory = (
  emitter: EventEmitter,
  db: DatabaseService,
  appStore: AppStore,
  roomStore: RoomStore,
  background: BackgroundProxy
) => {
  const iceServers = import.meta.env.DEV
    ? WEB_RTC_ICE_SERVERS["STUN"]
    : [...WEB_RTC_ICE_SERVERS["STUN"], ...WEB_RTC_ICE_SERVERS["TURN"]];
  const webrtc = new WebRtcController(appStore, emitter, (x, y) => x < y, {
    iceServers,
  });
  const room = new RoomController(db.room, emitter, appStore);
  const message = new MessageDispatcher(
    emitter,
    appStore,
    roomStore,
    background
  );
  return {
    emitter,
    webrtc,
    room,
    message,
  };
};

export const getOrCreateControllers = (() => {
  let initialized = false;
  let controllers: Controllers | undefined;

  return () => {
    if (initialized) return controllers!;

    initialized = true;

    controllers = createControllersFactory(
      emitter,
      db,
      useApp,
      useRoom,
      background
    );

    return controllers!;
  };
})();
