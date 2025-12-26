import monaco from "monaco-editor";
import { LocalStorage } from ".";
import type { GenericMessage, GenericResponse } from "./utils";

interface GetUserCodeRequest extends GenericMessage {
  action: "getUserCode";
}

interface SetupEditorsRequest extends GenericMessage {
  action: "setupEditors";
}

interface GetActiveTabIdRequest extends GenericMessage {
  action: "getActiveTabId";
}

interface CloseSignInTabRequest extends GenericMessage {
  action: "closeSignInTab";
  signIn: LocalStorage["signIn"];
}

interface GetLanguageExtensionRequest extends GenericMessage {
  action: "getLanguageExtension";
}

interface AppendTestCaseToLeetCodeRequest extends GenericMessage {
  action: "appendTestCaseToLeetCode";
  testValues: string[];
}

export type ServiceRequest =
  | GetUserCodeRequest
  | SetupEditorsRequest
  | GetActiveTabIdRequest
  | CloseSignInTabRequest
  | GetLanguageExtensionRequest
  | AppendTestCaseToLeetCodeRequest;

export enum ResponseStatus {
  SUCCESS,
  FAIL,
}

interface ServiceGenericResponse {
  status: ResponseStatus;
  message?: string;
}

export type ServiceResponse = GenericResponse<
  ServiceRequest,
  {
    getUserCode: {
      value: string;
      language: string;
    };
    setupEditors: ServiceGenericResponse;
    reloadExtension: void;
    getActiveTabId: number;
    closeSignInTab: ServiceGenericResponse;
    getLanguageExtension: Array<monaco.languages.ILanguageExtensionPoint>;
    appendTestCaseToLeetCode: ServiceGenericResponse;
  }
>;
