import axios from "axios";

interface TopicTag {
  name: string;
  id: string;
  slug: string;
}

interface Question {
  frontendQuestionId: string;
  topicTags: TopicTag[];
}

interface ProblemsetQuestionList {
  total: number;
  questions: Question[];
}

interface LeetcodeResponse {
  data: {
    problemsetQuestionList: ProblemsetQuestionList;
  };
}

interface ExtractedQuestion {
  id: string;
  tags: string[];
}

export const fetchQuestion = async (
  questionName: string
): Promise<ExtractedQuestion | undefined> => {
  const data = JSON.stringify({
    query: `query problemsetQuestionList(
    $categorySlug: String,
     $limit: Int,
      $skip: Int,
       $filters: QuestionListFilterInput) {  
           problemsetQuestionList: questionList(
                   categorySlug: $categorySlug
                       limit: $limit    
                       skip: $skip    
                       filters: $filters  ) {
                               total: totalNum
                                   questions: data {
                                             acRate      difficulty      freqBar      frontendQuestionId: questionFrontendId     isFavor      paidOnly: isPaidOnly     status     title      titleSlug      topicTags {        name        id      slug      }      hasSolution    hasVideoSolution    }  }}`,
    variables: {
      categorySlug: "",
      skip: 0,
      limit: 1,
      filters: { searchKeywords: questionName },
    },
  });

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://leetcode.com/graphql",
    headers: {
      "Content-Type": "application/json",
      Cookie:
        "csrftoken=NsiF0FFCwJcgg7CCjfyS7EmQuHK0nuXa230vMrDzDnUYRNHmjCy5bA8OfNxP4ElG",
    },
    data: data,
  };

  try {
    const response: LeetcodeResponse = await axios.request(config);
    const question = response.data.problemsetQuestionList.questions[0];
    const result = {
      id: question.frontendQuestionId,
      tags: question.topicTags.map((tag) => tag.name),
    };
    return result;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
