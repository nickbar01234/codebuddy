import { Preference } from "@cb/types";

// todo(nickbar01234): Small hack since background.ts file can't recognize client-side env
const env = (import.meta as any).env;

export const CodeBuddyPreference: Preference = {
  appPreference: {
    width: env.MODE === "development" ? 600 : 300 /* px */,
    isCollapsed: false,
  },
  codePreference: {
    height: 500,
  },
};
