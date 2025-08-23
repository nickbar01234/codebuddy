import { getOrCreateBackgroundMessenging } from "@cb/services/messenger";
import {
  ExtractMessage,
  MessagePayload,
  ServiceRequest,
  ServiceResponse,
} from "@cb/types";

const sendServiceRequest = <T extends ServiceRequest>(
  request: T
): Promise<ServiceResponse[T["action"]]> =>
  browser.runtime.sendMessage(request);

const background = {
  getCode: (args: MessagePayload<ExtractMessage<ServiceRequest, "getValue">>) =>
    sendServiceRequest({
      action: "getValue",
      ...args,
    }),

  setupCodeBuddyEditor: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "setupCodeBuddyModel">>
  ) => sendServiceRequest({ action: "setupCodeBuddyModel", ...args }),

  setupLeetCodeEditor: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "setupLeetCodeModel">>
  ) => sendServiceRequest({ action: "setupLeetCodeModel", ...args }),

  applyCodeToEditor: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "setValueOtherEditor">>
  ) => sendServiceRequest({ action: "setValueOtherEditor", ...args }),

  getActiveTab: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "getActiveTabId">>
  ) =>
    getOrCreateBackgroundMessenging().then(({ sendMessage }) =>
      sendMessage("getActiveTabId")
    ),

  closeSignInTab: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "closeSignInTab">>
  ) =>
    getOrCreateBackgroundMessenging().then(({ sendMessage }) =>
      sendMessage("closeSignInTab", args)
    ),

  getAllLanguageExtensions: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "getLanguageExtension">>
  ) => sendServiceRequest({ action: "getLanguageExtension", ...args }),
};

export default background;
export type BackgroundProxy = typeof background;
