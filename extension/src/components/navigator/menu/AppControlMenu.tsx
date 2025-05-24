import { ResetIcon } from "@cb/components/icons";
import { clearLocalStorage, sendServiceRequest } from "@cb/services";
import { throttle } from "lodash";
import { Hammer } from "lucide-react";
import React from "react";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

export const _AppControlMenu = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resetExtensionThrottled = React.useMemo(() => {
    return throttle((event: Event) => {
      event.stopPropagation?.();
      clearLocalStorage();
    }, 1000);
  }, []);

  return (
    <>
      <DropdownMenuItem onSelect={resetExtensionThrottled}>
        <span className="flex items-center gap-2">
          <ResetIcon /> <span>Reset Extension</span>
        </span>
      </DropdownMenuItem>
      {import.meta.env.MODE === "development" && (
        <DropdownMenuItem
          onSelect={() => sendServiceRequest({ action: "reloadExtension" })}
        >
          <span className="flex items-center gap-2">
            <Hammer />
            <span>Reload extension</span>
          </span>
        </DropdownMenuItem>
      )}
    </>
  );
};

export const AppControlMenu = () => (
  <Menu>
    <_AppControlMenu />
  </Menu>
);
