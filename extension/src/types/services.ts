import type {
  GenericMessage,
  GenericResponse,
  LeetCodeContentChange,
} from "./utils";

export interface User {
  id: string;
  username: string;
}

export type Status =
  | {
      status: "AUTHENTICATED";
      user: User;
    }
  | { status: "LOADING" }
  | { status: "UNAUTHENTICATED" };

interface CookieRequest extends GenericMessage {
  action: "cookie";
}

interface GetValueRequest extends GenericMessage {
  action: "getValue";
}

interface SetValueRequest extends GenericMessage {
  action: "setValue";
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

interface CleanEditorRequest extends GenericMessage {
  action: "cleanEditor";
}

export type ServiceRequest =
  | CookieRequest
  | GetValueRequest
  | SetValueRequest
  | SetupCodeBuddyModel
  | SetOtherEditorRequest
  | CleanEditorRequest
  | SetupLeetCodeModel;

export type ServiceResponse = GenericResponse<
  ServiceRequest,
  {
    cookie: Status;
    getValue: {
      value: string;
      language: string;
    };
    setValue: void;
    setupCodeBuddyModel: void;
    setupLeetCodeModel: void;
    setValueOtherEditor: void;
    cleanEditor: void;
  }
>;
