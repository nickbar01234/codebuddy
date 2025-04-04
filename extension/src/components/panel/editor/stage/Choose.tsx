import { QuestionSelectorPanel } from "@cb/components/panel/problem/index";
import { useRTC } from "@cb/hooks/index";

export const Choose = () => {
  const { handleChooseQuestion } = useRTC();
  return <QuestionSelectorPanel handleQuestionSelect={handleChooseQuestion} />;
};
