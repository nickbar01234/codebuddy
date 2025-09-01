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
const LOCAL_STORAGE: Array<keyof LocalStorage> = [
  "tabs",
  "lastActivePeer",
  "signIn",
  "navigate",
  "preference",
  "closingTabs",
  "navigatePrompt",
  "appEnabled",
];

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

export const clearLocalStorageForRoom = () =>
  clearLocalStorage(["preference", "signIn"]);

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
  let initialized = false;
  let controllers: Controllers | undefined = undefined;
  return () => {
    if (initialized) {
      return controllers!;
    }
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
    initialized = true;
    controllers = {
      emitter,
      webrtc,
      room,
      message,
    };
    return controllers;
  };
};

export const getOrCreateControllers = createControllersFactory(
  emitter,
  db,
  useApp,
  useRoom,
  background
);

export { getIframeService } from "../components/iframe/IframeContainer";
