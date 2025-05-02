import { getAllSessionId } from "@cb/db";
import { useEffect, useState } from "react";
export const useFetchPastQuestions = (roomId: string | null) => {
  const [pastQuestionsId, setPastQuestionsId] = useState<string[]>([]);
  useEffect(() => {
    if (!roomId) {
      return;
    }
    const fetchPastSessionsId = async () => {
      const pastSessionsId = await getAllSessionId(roomId);
      setPastQuestionsId(pastSessionsId);
    };
    fetchPastSessionsId();
  }, [roomId]);
  return pastQuestionsId;
};
