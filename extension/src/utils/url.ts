export const getQuestionIdFromUrl = (url: string) => {
  const pattern = /(?<=problems\/)[^/]+/;
  const match = url.match(pattern);
  console.log("parsing url", url);

  if (match) {
    return match[0];
  }

  throw new Error("Invalid Leetcode URL");
};

export const constructUrlFromQuestionId = (questionId: string) => {
  return `https://leetcode.com/problems/${questionId}`;
};
