import { useRoom } from "@cb/store/roomStore";
import { useCallback } from "react";

/**
 * Hook to manually trigger saving code progress to the database
 */
export const useSaveCodeProgress = () => {
  const saveCodeProgress = useRoom(
    (state) => state.actions.room.saveCodeProgress
  );

  return useCallback(() => {
    saveCodeProgress();
  }, [saveCodeProgress]);
};
