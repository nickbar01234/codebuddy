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

interface CreateMonacoModelRequest {
  action: "createModel";
  id: string;
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
  editorId: string;
}

interface UpdateEditorLayoutRequest {
  action: "updateEditorLayout";
  monacoEditorId: string;
}

interface CleanEditorRequest {
  action: "cleanEditor";
}

export type ServiceRequest =
  | CookieRequest
  | GetValueRequest
  | SetValueRequest
  | CreateMonacoModelRequest
  | SetOtherEditorRequest
  | UpdateEditorLayoutRequest
  | CleanEditorRequest;

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
  cleanEditor: void;
};

interface AppPreference {
  width: number;
  isCollapsed: boolean;
}

interface CodePreference {
  height: number;
}

interface Assignment {
  variable: string;
  value: string;
}

export interface TestCase {
  selected: boolean;
  test: Assignment[];
}

export interface Peer {
  id: string;
  active: boolean;
  viewable: boolean;
  tests: TestCase[];
}

export interface ExtensionStorage {
  appPreference: AppPreference;
  codePreference: CodePreference;
}

export interface LocalStorage {
  curRoomId: {
    roomId: string;
    numberOfUsers: number;
  };
  tabs: {
    roomId: string | null;
    peers: Peer[];
  };
}

export interface PeerCodeMessage {
  action: "code";
  code: ServiceResponse["getValue"];
  changes: string;
}

export interface PeerTestMessage {
  action: "tests";
  tests: string[];
}

export interface HeartBeatMessage {
  action: "heartbeat";
  username: string;
  roomId: string;
  ack: boolean;
}

export interface PeerState {
  latency: number;
  deviation: number;
  connected: boolean;
}

export type Payload<T> = Omit<T, "action">;

export type PeerMessage = PeerCodeMessage | PeerTestMessage | HeartBeatMessage;
