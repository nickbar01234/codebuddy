import monaco from "monaco-editor";
import { LocalStorage } from ".";
import type { GenericMessage, GenericResponse } from "./utils";

interface GetValueRequest extends GenericMessage {
  action: "getValue";
}

interface SetupCodeBuddyModel extends GenericMessage {
  action: "setupCodeBuddyModel";
  id: string;
}

interface SetupLeetCodeModel extends GenericMessage {
  action: "setupLeetCodeModel";
}

interface SetOtherEditorRequest extends GenericMessage {
  action: "setValueOtherEditor";
  code: string;
  language: string;
  changes?: monaco.editor.IModelContentChange;
  changeUser: boolean;
  editorId: string;
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

export type ServiceRequest =
  | GetValueRequest
  | SetupCodeBuddyModel
  | SetOtherEditorRequest
  | SetupLeetCodeModel
  | GetActiveTabIdRequest
  | CloseSignInTabRequest
  | GetLanguageExtensionRequest;

export enum ResponseStatus {
  SUCCESS,
  FAIL,
}

interface GenericSuccessResponse<T> {
  status: ResponseStatus.SUCCESS;
  data: T;
}

interface GenericFailureResponse {
  status: ResponseStatus.FAIL;
  message?: string;
}

type ServiceGenericResponse<T> =
  | GenericFailureResponse
  | GenericSuccessResponse<T>;

export type ServiceResponse = GenericResponse<
  ServiceRequest,
  {
    getValue: {
      value: string;
      language: string;
    };
    setupCodeBuddyModel: ServiceGenericResponse<unknown>;
    setupLeetCodeModel: ServiceGenericResponse<{ language: string }>;
    setValueOtherEditor: void;
    reloadExtension: void;
    getActiveTabId: number;
    closeSignInTab: ServiceGenericResponse<undefined>;
    getLanguageExtension: Array<monaco.languages.ILanguageExtensionPoint>;
  }
>;
