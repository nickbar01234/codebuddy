import { URLS } from "@cb/constants";

export const getQuestionIdFromUrl = (url: string) => {
  const pattern = /(?<=problems\/)[^/?]+/;
  const match = url.match(pattern);

  if (match) {
    return match[0];
  }

  console.error("Cannot get question ID from url", url);
  return "";
};

export const hasQuestionIdInUrl = (url: string) =>
  getQuestionIdFromUrl(url) !== "";

export const constructUrlFromQuestionId = (questionId: string) => {
  return `${URLS.PROBLEMS}/${questionId}`;
};

export const getNormalizedUrl = (url: string) =>
  constructUrlFromQuestionId(getQuestionIdFromUrl(url));
