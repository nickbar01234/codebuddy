export * from "./services";
export * from "./peers";
export * from "./window";
export * from "./user-session";
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

export interface Preference {
  appPreference: AppPreference;
  codePreference: CodePreference;
}

export interface LocalStorage {
  tabs: {
    roomId: string;
    peers: Record<string, Peer>;
  };
  test?: {
    peer: string;
    roomId?: string;
  };
  lastActivePeer: string;
  signIn: {
    email: string;
    url: string;
    tabId: number;
  };
  preference: Preference;
}
