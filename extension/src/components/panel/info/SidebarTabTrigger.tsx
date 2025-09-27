import { useRoomActions, useRoomData } from "@cb/hooks/store";
import { SidebarTabIdentifier } from "@cb/store";

interface SidebarTabTriggerProps {
  forTab: SidebarTabIdentifier;
  trigger: React.ReactNode;
}

export const SidebarTabTrigger = ({
  forTab,
  trigger,
}: SidebarTabTriggerProps) => {
  const { selectSidebarTab } = useRoomActions();
  const { activeSidebarTab } = useRoomData();

  return (
    <button
      className={cn("transition-colors p-1", {
        "bg-[--color-button-primary-border] rounded-md":
          forTab === activeSidebarTab,
        "hover:bg-[--color-tab-hover-background] focus:bg-[--color-tab-hover-background] hover:rounded-md cursor-pointer":
          forTab !== activeSidebarTab,
      })}
      onClick={(e) => {
        e.stopPropagation();
        selectSidebarTab(forTab);
      }}
      disabled={forTab === activeSidebarTab}
    >
      {trigger}
    </button>
  );
};
