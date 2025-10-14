import { ResetIcon } from "@cb/components/icons";
import { clearLocalStorage } from "@cb/services";
import { throttle } from "lodash";
import { MessageCircle } from "lucide-react";
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
      <DropdownMenuItem>
        <span className="flex items-center gap-2">
          <MessageCircle />
          <a
            href="https://forms.gle/6L1VDHzcGhpEC1Xb9"
            target="_blank"
            rel="noopener noreferrer"
          >
            Submit feeback
          </a>
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={resetExtensionThrottled}>
        <span className="flex items-center gap-2">
          <ResetIcon /> <span>Reset Extension</span>
        </span>
      </DropdownMenuItem>
    </>
  );
};

export const AppControlMenu = () => (
  <Menu>
    <_AppControlMenu />
  </Menu>
);
