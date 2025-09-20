import { useRoomActions } from "@cb/hooks/store";
import { SheetTrigger } from "@cb/lib/components/ui/sheet";
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
  return (
    <SheetTrigger asChild onClick={() => selectSidebarTab(forTab)}>
      <div className="cursor-pointer hover:bg-[--color-tab-hover-background] focus:bg-[--color-tab-hover-background] p-1 hover:rounded-md">
        {trigger}
      </div>
    </SheetTrigger>
  );
};
