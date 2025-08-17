import { useRoom } from "@cb/store";
import React from "react";
import { toast } from "sonner";
import { useOnMount } from "./useOnMount";

export { useFirebaseListener, useOnMount };

export const useCopyRoomId = () => {
  const id = useRoom((state) => state.room?.id);
  return React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (id != undefined) {
        navigator.clipboard.writeText(id);
        toast.success("Room ID copied to clipboard");
      }
    },
    [id]
  );
};
