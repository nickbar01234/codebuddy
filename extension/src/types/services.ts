import { LocalStorage } from ".";
import type {
  GenericMessage,
  GenericResponse,
  LeetCodeContentChange,
} from "./utils";

interface GetValueRequest extends GenericMessage {
  action: "getValue";
}

interface PastCodeRequest extends GenericMessage {
  action: "pasteCode";
  value: string;
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
  changes: LeetCodeContentChange;
  changeUser: boolean;
  editorId: string;
}

interface ReloadExtensionRequest extends GenericMessage {
  action: "reloadExtension";
}

interface GetActiveTabIdRequest extends GenericMessage {
  action: "getActiveTabId";
}

interface CloseSignInTabRequest extends GenericMessage {
  action: "closeSignInTab";
  signIn: LocalStorage["signIn"];
}

export type ServiceRequest =
  | GetValueRequest
  | PastCodeRequest
  | SetupCodeBuddyModel
  | SetOtherEditorRequest
  | SetupLeetCodeModel
  | ReloadExtensionRequest
  | GetActiveTabIdRequest
  | CloseSignInTabRequest;

export enum ResponseStatus {
  SUCCESS,
  FAIL,
}

interface ServiceGenericResponse {
  status: ResponseStatus;
}

export type ServiceResponse = GenericResponse<
  ServiceRequest,
  {
    getValue: {
      value: string;
      language: string;
    };
    pasteCode: void;
    setupCodeBuddyModel: ServiceGenericResponse;
    setupLeetCodeModel: ServiceGenericResponse;
    setValueOtherEditor: void;
    reloadExtension: void;
    getActiveTabId: number;
    closeSignInTab: ServiceGenericResponse;
  }
>;
