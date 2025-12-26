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
  getUserCode: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "getUserCode">>
  ) =>
    sendServiceRequest({
      action: "getUserCode",
      ...args,
    }),

  setupEditors: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "setupEditors">>
  ) =>
    sendServiceRequest({
      action: "setupEditors",
      ...args,
    }),

  getActiveTab: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "getActiveTabId">>
  ) => sendServiceRequest({ action: "getActiveTabId", ...args }),

  closeSignInTab: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "closeSignInTab">>
  ) => sendServiceRequest({ action: "closeSignInTab", ...args }),

  getAllLanguageExtensions: (
    args: MessagePayload<ExtractMessage<ServiceRequest, "getLanguageExtension">>
  ) => sendServiceRequest({ action: "getLanguageExtension", ...args }),

  appendTestCaseToLeetCode: (
    args: MessagePayload<
      ExtractMessage<ServiceRequest, "appendTestCaseToLeetCode">
    >
  ) => sendServiceRequest({ action: "appendTestCaseToLeetCode", ...args }),
};

export default background;
export type BackgroundProxy = typeof background;
