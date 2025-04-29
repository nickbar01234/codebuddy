import { LeaveIcon } from "@cb/components/icons";
import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import { throttle } from "lodash";
import React from "react";

interface ClosablePanelProps {
  onClose: () => void;
  children: React.ReactNode;
  closeButtonName: string;
  className?: string;
}

const ClosablePanel: React.FC<ClosablePanelProps> = ({
  onClose,
  children,
  closeButtonName,
  className = "",
}) => {
  const onCloseThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      onClose();
    }, 1000);
  }, [onClose]);

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full p-4 dark:bg-dark-layer-bg",
        className
      )}
    >
      <Button
        variant="outline"
        className="self-start left-7 top-5 px-4 py-2 z-30 dark:text-white hover:bg-[--color-button-hover-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
        onClick={onCloseThrottled}
      >
        <div className="flex items-center justify-center gap-3">
          <LeaveIcon />
          <span className="text-base font-medium">{closeButtonName}</span>
        </div>
      </Button>
      {children}
    </div>
  );
};

export default ClosablePanel;
