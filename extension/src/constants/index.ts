import { Preference } from "@cb/types";

const env = import.meta.env;

export const CodeBuddyPreference: Preference = {
  appPreference: {
    width: env.MODE === "development" ? 600 : 300 /* px */,
    isCollapsed: false,
  },
  codePreference: {
    height: 500,
  },
};

export const LEETCODE_PROBLEMS_URL = "https://leetcode.com/problems";
