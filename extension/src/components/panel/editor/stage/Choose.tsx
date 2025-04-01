import { QuestionSelector } from "@cb/components/leetcode/QuestionSelector";
import { useRTC } from "@cb/hooks/index";

export const Choose = () => {
  const { handleChooseQuestion } = useRTC();
  return <QuestionSelector handleQuestionSelect={handleChooseQuestion} />;
};
