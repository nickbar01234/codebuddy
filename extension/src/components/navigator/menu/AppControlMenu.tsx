import { ResetIcon } from "@cb/components/icons";
import { clearLocalStorage, sendServiceRequest } from "@cb/services";
import { throttle } from "lodash";
import { Hammer } from "lucide-react";
import React from "react";
import { RoomControlDropdownMenuItem } from "./RoomControlDropdownMenuItem";

export const AppControlMenu = () => {
  const resetExtensionThrottled = React.useMemo(() => {
    return throttle((event: Event) => {
      event.stopPropagation?.();
      clearLocalStorage();
    }, 1000);
  }, []);

  return (
    <>
      <RoomControlDropdownMenuItem onSelect={resetExtensionThrottled}>
        <span className="flex items-center gap-2">
          <ResetIcon /> <span>Reset Extension</span>
        </span>
      </RoomControlDropdownMenuItem>
      {import.meta.env.MODE === "development" && (
        <RoomControlDropdownMenuItem
          onSelect={() => sendServiceRequest({ action: "reloadExtension" })}
        >
          <span className="flex items-center gap-2">
            <Hammer />
            <span>Reload extension</span>
          </span>
        </RoomControlDropdownMenuItem>
      )}
    </>
  );
};
