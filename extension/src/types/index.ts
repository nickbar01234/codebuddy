export * from "./services";
export * from "./peers";
export * from "./window";
export type {
  MessagePayload,
  ExtractMessage,
  LeetCodeContentChange,
} from "./utils";

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
  test?: {
    peer: string;
  };
}
