import { LEETCODE_PROBLEMS_URL } from "@cb/constants";

export const getQuestionIdFromUrl = (url: string) => {
  const pattern = /(?<=problems\/)[^/]+/;
  const match = url.match(pattern);

  if (match) {
    return match[0];
  }

  throw new Error("Invalid Leetcode URL");
};

export const getSessionId = () => getQuestionIdFromUrl(window.location.href);

export const constructUrlFromQuestionId = (questionId: string) => {
  return `${LEETCODE_PROBLEMS_URL}/${questionId}`;
};
