export * from "./peers";
export * from "./services";
export * from "./user-session";
export type {
  ExtractMessage,
  LeetCodeContentChange,
  MessagePayload,
} from "./utils";
export * from "./window";

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

// Refactor post redux
export interface LocalStorage {
  tabs: {
    roomId: string;
    sessions: Record<string, Record<string, Peer>>;
  };
  test?: {
    peer: string;
    roomId?: string;
  };
  lastActivePeer: string;
  navigate: string;
  signIn: {
    email: string;
    url: string;
    tabId: number;
  };
  preference: Preference;
  closingTabs: boolean;
  navigatePrompt: Record<string, boolean>; // Whether we have prompted user to navigate
}
