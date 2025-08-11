import { AppStore, roomStore, RoomStore, useApp } from "@cb/store";
import {
  DatabaseService,
  EventEmitter,
  LocalStorage,
  ServiceRequest,
  ServiceResponse,
} from "@cb/types";
import mitt from "mitt";
import { MessageController } from "./controllers/MessageController";
import { RoomController } from "./controllers/RoomController";
import { WebRtcController } from "./controllers/WebRtcController";
import db from "./db";

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

export const sendServiceRequest = <T extends ServiceRequest>(
  request: T
): Promise<ServiceResponse[T["action"]]> =>
  browser.runtime.sendMessage(request);

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
  message: MessageController;
}

const createControllersFactory = (
  db: DatabaseService,
  appStore: AppStore,
  roomStore: RoomStore
) => {
  let initialized = false;
  let controllers: Controllers | undefined = undefined;
  return () => {
    if (initialized) {
      return controllers!;
    }
    const emitter: EventEmitter = mitt();
    const webrtc = new WebRtcController(appStore, emitter, (x, y) => x < y);
    const room = new RoomController(db.room, emitter, appStore);
    const message = new MessageController(emitter, roomStore);
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
  db,
  useApp,
  roomStore
);
