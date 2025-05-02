import { getAllSessionId } from "@cb/db";
import { useEffect, useState } from "react";

export const useFetchPastQuestions = ({
  roomId,
}: {
  roomId: string | null;
}) => {
  const [pastQuestionsId, setPastQuestionsId] = useState<string[]>([]);
  useEffect(() => {
    if (!roomId) {
      return;
    }

    getAllSessionId(roomId)
      .then((pastSessionsId) => setPastQuestionsId(pastSessionsId))
      .catch((error) => {
        console.error("Error fetching past questions", error);
      });
  }, [roomId]);
  return pastQuestionsId;
};
