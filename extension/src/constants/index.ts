const LEETCODE_BASE = "https://leetcode.com";

export const URLS = {
  PROBLEMSET: `${LEETCODE_BASE}/problemset`,
  PROBLEMS: `${LEETCODE_BASE}/problems`,
  ALL_PROBLEMS: `${LEETCODE_BASE}/problems/*`,
};

export const DOM = {
  CODEBUDDY_EDITOR_ID: "CodeBuddyEditor",
  LEETCODE_ROOT_ID: "#qd-content",
  LEETCODE_TEST_ID: ".cm-content",
  LEETCODE_SUBMIT_BUTTON: '[data-e2e-locator="console-submit-button"]',
  LEETCODE_SUBMISSION_RESULT: '[data-e2e-locator="submission-result"]',
  INJECTED_LEETCODE_PROBLEMSET_IFRAME: "LeetCodeProblemSet",
  INJECTED_LEETCODE_PROBLEMSET_IFRAME_CONTAINER: "LeetCodeProblemSetContainer",
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
