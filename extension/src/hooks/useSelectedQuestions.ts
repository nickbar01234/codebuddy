import { getAllSessionId } from "@cb/db";
import { useEffect, useState } from "react";

export const useSelectedQuestions = ({ roomId }: { roomId: string | null }) => {
  const [selectedQuestionsId, setSelectedQuestionsId] = useState<string[]>([]);
  useEffect(() => {
    if (!roomId) {
      return;
    }

    getAllSessionId(roomId)
      .then((selectedSession) => setSelectedQuestionsId(selectedSession))
      .catch((error) => {
        console.error("Error fetching selected questions", error);
      });
  }, [roomId]);
  return selectedQuestionsId;
};
