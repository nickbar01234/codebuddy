import { IDS } from "@cb/constants";
import { BackgroundProtocol, WindowProtocol } from "@cb/types";
import {
  defineWindowMessaging,
  WindowMessenger,
} from "@webext-core/messaging/page";

export const createWindowMessengerFactory = (namespace: string) => {
  let messenger: WindowMessenger<WindowProtocol> | undefined = undefined;
  return () => {
    if (messenger == undefined) {
      messenger = defineWindowMessaging<WindowProtocol>({ namespace });
    }
    return messenger;
  };
};

export const getOrCreateBackgroundMessenging = async () => {
  const { defineExtensionMessaging } = await import("@webext-core/messaging");
  return defineExtensionMessaging<BackgroundProtocol>();
};

export const getOrCreateWindowMesseger = createWindowMessengerFactory(
  IDS.CODE_BUDDY
);
