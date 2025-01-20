import { ExtensionStorage } from "@cb/types";

// todo(nickbar01234): Small hack since .ts file can't recognize client-side env
const development = (import.meta as any).env.MODE;

export const CodeBuddyPreference: ExtensionStorage = {
  appPreference: {
    width: development ? 600 : 300 /* px */,
    isCollapsed: false,
  },
  codePreference: {
    height: 500,
  },
};
