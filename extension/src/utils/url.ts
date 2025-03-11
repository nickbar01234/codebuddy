export const getQuestionIdFromUrl = (url: string) => {
  const pattern = /(?<=problems\/)[^/]+/;
  const match = url.match(pattern);

  if (match) {
    return match[0];
  }

  throw new Error("Invalid Leetcode URL");
};

export const constructUrlFromQuestionId = (questionId: string) => {
  return `https://leetcode.com/problems/${questionId}`;
};
