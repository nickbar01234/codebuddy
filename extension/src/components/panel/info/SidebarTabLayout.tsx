import { useRoomData } from "@cb/hooks/store";
import { SidebarTabIdentifier } from "@cb/store";

interface SidebarTabLayoutProps {
  forTab: SidebarTabIdentifier;
  children: React.ReactNode;
}

export const SidebarTabLayout = ({
  forTab,
  children,
}: SidebarTabLayoutProps) => {
  const { activeSidebarTab } = useRoomData();
  return (
    <div
      className={cn("h-full w-full flex flex-col gap-6", {
        hidden: activeSidebarTab !== forTab,
      })}
    >
      {children}
    </div>
  );
};
