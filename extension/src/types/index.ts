import { User } from "firebase/auth";

export interface AppUser extends User {
  username: string;
}

export type Status =
  | {
      status: "AUTHENTICATED";
      user: AppUser;
    }
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

export interface SetOtherEditorRequest {
  action: "setValueOtherEditor";
  code: string;
  language: string;
  changes: {
    range: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    };
    rangeLength: number;
    text: string;
    rangeOffset: number;
    forceMoveMarkers: boolean;
  };
  changeUser: boolean;
}

interface UpdateEditorLayoutRequest {
  action: "updateEditorLayout";
  monacoEditorId: string;
}

export type ServiceRequest =
  | CookieRequest
  | GetValueRequest
  | SetValueRequest
  | createMonacoModelRequest
  | SetOtherEditorRequest
  | UpdateEditorLayoutRequest;

export type ServiceResponse = {
  cookie: Status;
  getValue: {
    value: string;
    language: string;
  };
  setValue: void;
  createModel: void;
  setValueOtherEditor: void;
  updateEditorLayout: void;
};

interface EditorPreference {
  width: number;
  isCollapsed: boolean;
}

export interface ExtensionStorage {
  editorPreference: EditorPreference;
}
