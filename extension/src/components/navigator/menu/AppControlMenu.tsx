import { ResetIcon } from "@cb/components/icons";
import { clearLocalStorage } from "@cb/services";
import { throttle } from "lodash";
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
    <DropdownMenuItem onSelect={resetExtensionThrottled}>
      <span className="flex items-center gap-2">
        <ResetIcon /> <span>Reset Extension</span>
      </span>
    </DropdownMenuItem>
  );
};

export const AppControlMenu = () => (
  <Menu>
    <_AppControlMenu />
  </Menu>
);
