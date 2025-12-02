import { WEB_RTC_ICE_SERVERS } from "@cb/constants";
import { AppStore, RoomStore, useApp, useRoom } from "@cb/store";
import { DatabaseService, LocalStorage } from "@cb/types";
import background, { BackgroundProxy } from "./background";
import { MessageDispatcher } from "./controllers/MessageDispatcher";
import { RoomController } from "./controllers/RoomController";
import { WebRtcController } from "./controllers/WebRtcController";
import db from "./db";
import { emitter, EventEmitter } from "./events";

const LOCAL_STORAGE_PREFIX = "codebuddy";
// todo(nickbar01234): Need a more robust typescript solution
const LOCAL_STORAGE: Array<keyof LocalStorage> = ["signIn"];

export const getLocalStorage = <K extends keyof LocalStorage>(key: K) => {
  const maybeItem = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
  return maybeItem == null
    ? undefined
    : (JSON.parse(maybeItem) as LocalStorage[K]);
};

export const removeLocalStorage = <K extends keyof LocalStorage>(key: K) => {
  localStorage.removeItem(LOCAL_STORAGE_PREFIX + key);
};

export const setLocalStorage = <K extends keyof LocalStorage>(
  key: K,
  value: LocalStorage[K]
) => {
  localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
};

export const clearLocalStorage = (ignore: Array<keyof LocalStorage> = []) =>
  LOCAL_STORAGE.filter((key) => !ignore.includes(key)).forEach(
    removeLocalStorage
  );

export const clearLocalStorageForRoom = () => clearLocalStorage(["signIn"]);

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
