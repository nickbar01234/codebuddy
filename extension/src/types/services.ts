import type { GenericMessage, GenericResponse } from "./utils";

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

interface SetOtherEditorRequest extends GenericMessage {
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
  editorId: string;
}

interface UpdateEditorLayoutRequest extends GenericMessage {
  action: "updateEditorLayout";
  monacoEditorId: string;
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
  | UpdateEditorLayoutRequest
  | CleanEditorRequest;

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
    setValueOtherEditor: void;
    updateEditorLayout: void;
    cleanEditor: void;
  }
>;
