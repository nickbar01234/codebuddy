const LEETCODE_BASE = "https://leetcode.com";

export const URLS = {
  PROBLEMSET: `${LEETCODE_BASE}/problemset`,
  PROBLEMS: `${LEETCODE_BASE}/problems`,
  ALL_PROBLEMS: `${LEETCODE_BASE}/problems/*`,
};

export const DOM = {
  CODEBUDDY_EXTENSION_ID: "CodeBuddy",
  CODEBUDDY_EDITOR_ID: "CodeBuddyEditor",
  CODEBUDDY_SIDEBAR_ID: "CodeBuddySidebar",
  IFRAME_CSS_ID: "codebuddy-css",
  LEETCODE_ROOT_ID: "#qd-content",
  LEETCODE_TEST_ID: ".cm-content",
  LEETCODE_SUBMIT_BUTTON: '[data-e2e-locator="console-submit-button"]',
  LEETCODE_SUBMISSION_RESULT: '[data-e2e-locator="submission-result"]',
  PROBLEM_ID: ".elfjS",
  TIMEOUT: 10_000,
};

export const HEARTBEAT = {
  // ms
  INTERVAL: 15000,
  // ms
  CHECK_ALIVE_INTERVAL: 15000,
  // seconds
  TIMEOUT: 100,
};

export const ROOM = {
  CAPACITY: 4,
};

export const WEBRTC_RETRY = {
  MAX_ATTEMPTS: 10,
};

export const WEB_RTC_ICE_SERVERS: Record<"STUN" | "TURN", RTCIceServer[]> = {
  STUN: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],

  // todo(nickbar01234): Potentially more dynamic RTC configuration. See https://www.metered.ca/tools/openrelay/
  TURN: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:standard.relay.metered.ca:80",
      username: "d10b718111d856f26b3b1c23",
      credential: "RdNfpZTnep+QhVDg",
    },
    {
      urls: "turn:standard.relay.metered.ca:80?transport=tcp",
      username: "d10b718111d856f26b3b1c23",
      credential: "RdNfpZTnep+QhVDg",
    },
    {
      urls: "turn:standard.relay.metered.ca:443",
      username: "d10b718111d856f26b3b1c23",
      credential: "RdNfpZTnep+QhVDg",
    },
    {
      urls: "turns:standard.relay.metered.ca:443?transport=tcp",
      username: "d10b718111d856f26b3b1c23",
      credential: "RdNfpZTnep+QhVDg",
    },
  ],
};

export const FEATURE_FLAG = {
  DISABLE_BROWSE_ROOM: true,
};

export const CSS = {
  DIFFICULTY: {
    Easy: "text-difficulty-easy",
    Medium: "text-difficulty-medium",
    Hard: "text-difficulty-hard",
  } as Record<any, string>,

  // See index.css
  USER_ICON_CSS: [
    {
      icon: "user-1",
      accent: "user-1-accent",
    },
    {
      icon: "user-2",
      accent: "user-2-accent",
    },
    {
      icon: "user-3",
      accent: "user-3-accent",
    },
    {
      icon: "user-4",
      accent: "user-4-accent",
    },
  ] as const,
};

export const EXTENSION = {
  CSS_PATH: "content-scripts/content.css",
};
