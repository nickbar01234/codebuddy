import { useRoomActions, useRoomSelectedSidebarTab } from "@cb/hooks/store";
import { Sheet, SheetContent, SheetTrigger } from "@cb/lib/components/ui/sheet";
import { SidebarTabIdentifier } from "@cb/store";

interface BaseInfoSheetProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  sidebarTabIdentifier: SidebarTabIdentifier;
}

export const BaseInfoSheet = ({
  sidebarTabIdentifier,
  trigger,
  children,
}: BaseInfoSheetProps) => {
  const activeSidebarTab = useRoomSelectedSidebarTab();
  const { openSidebarTab, closeSidebarTabIfIsActive } = useRoomActions();

  return (
    <Sheet
      open={activeSidebarTab === sidebarTabIdentifier}
      onOpenChange={(open) =>
        closeSidebarTabIfIsActive(sidebarTabIdentifier, open)
      }
    >
      <SheetTrigger
        asChild
        onClick={() => {
          console.log("Clicking trigger", sidebarTabIdentifier);
          openSidebarTab(sidebarTabIdentifier);
        }}
      >
        <div className="cursor-pointer hover:bg-[--color-tab-hover-background] focus:bg-[--color-tab-hover-background]">
          {trigger}
        </div>
      </SheetTrigger>
      <SheetContent
        className={cn(
          "bg-secondary z-[2000] [&>button:first-of-type]:hidden w-6/12 ml-10"
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
};
