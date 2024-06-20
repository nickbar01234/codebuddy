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

interface CookieRequest {
  action: "cookie";
}
interface GetValueRequest {
  action: "getValue";
}

interface SetValueRequest {
  action: "setValue";
  value: string;
}

interface createMonacoModelRequest {
  action: "createModel";
  id: string;
  code: string;
  language: string;
}

interface SetOtherEditorRequest {
  action: "setValueOtherEditor";
  code: string;
  language: string;
}

export type ServiceRequest =
  | CookieRequest
  | GetValueRequest
  | SetValueRequest
  | createMonacoModelRequest
  | SetOtherEditorRequest;

export type ServiceResponse = {
  cookie: Status;
  getValue: {
    value: string;
    language: string;
  };
  setValue: void;
  createModel: void;
  setValueOtherEditor: void;
};

interface EditorPreference {
  width: number;
  isCollapsed: boolean;
}

export interface ExtensionStorage {
  editorPreference: EditorPreference;
}
