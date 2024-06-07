import { ServiceRequest, ServiceResponse } from "../types";

export const sendMessage = <T extends ServiceRequest>(
  request: T
): Promise<ServiceResponse[T["action"]]> => chrome.runtime.sendMessage(request);
