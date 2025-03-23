import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import { usePeerSelection } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import { Separator } from "@cb/lib/components/ui/separator";
import React, { useState } from "react";

type TabItem = {
  label: React.ReactNode;
  content: React.ReactNode;
};

interface TabsProps {
  tabs: TabItem[];
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, className }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const toggleUserDropdown = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      e.stopPropagation();
      setUserDropdownOpen((prev) => !prev);
    },
    []
  );
  const { activePeer } = usePeerSelection();

  const renderTabs = React.useMemo(() => {
    const tabsList = tabs
      .flatMap((tab, index) => [
        <Separator
          key={`divider-${index}`}
          orientation="vertical"
          className="flexlayout__tabset_tab_divider mx-3 h-[1rem] bg-[--color-tabset-tabbar-background]"
        />,
        <button
          key={index}
          onClick={() => setActiveIndex(index)}
          className={cn("py-2 text-sm font-medium transition-all")}
        >
          <div
            className={cn(
              "h-full w-full",
              index === activeIndex ? "border-b-2 border-orange-500" : ""
            )}
          >
            {tab.label}
          </div>
        </button>,
      ])
      .filter(Boolean);

    if (activePeer?.id) {
      tabsList.unshift(
        <UserDropdown
          key={"user-dropdown"}
          isOpen={isUserDropdownOpen}
          toggle={toggleUserDropdown}
        />
      );
    }

    return tabsList;
  }, [
    tabs,
    activeIndex,
    activePeer?.id,
    isUserDropdownOpen,
    toggleUserDropdown,
  ]);

  return (
    <div className={cn("h-full w-full", className)}>
      <div className="flex items-center">{renderTabs.map((tab) => tab)}</div>
      <div className="relative mt-1">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={cn(
              "absolute left-0 top-0 w-full transition-opacity duration-300",
              index === activeIndex
                ? "visible opacity-100"
                : "invisible opacity-0"
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
