import { URLS } from "@cb/constants";

export const getQuestionIdFromUrl = (url: string) => {
  const pattern = /(?<=problems\/)[^/?]+/;
  const match = url.match(pattern);

  if (match) {
    return match[0];
  }

  throw new Error(`Invalid Leetcode URL ${url}`);
};

export const hasQuestionIdInUrl = (url: string) => {
  try {
    getQuestionIdFromUrl(url);
    return true;
  } catch (e) {
    console.error("Failed to extract question ID", e);
    return false;
  }
};

export const constructUrlFromQuestionId = (questionId: string) => {
  return `${URLS.PROBLEMS}/${questionId}`;
};

export const getNormalizedUrl = (url: string) =>
  constructUrlFromQuestionId(getQuestionIdFromUrl(url));
