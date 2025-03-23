import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import { usePeerSelection } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
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
  const toggleUserDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setUserDropdownOpen(!isUserDropdownOpen);
  };
  const { activePeer } = usePeerSelection();

  return (
    <div className={cn("h-full w-full", className)}>
      <div className="flex">
        {activePeer?.id && (
          <div className="flex items-center">
            <UserDropdown
              isOpen={isUserDropdownOpen}
              toggle={toggleUserDropdown}
            />
          </div>
        )}

        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn("py-2 text-sm font-medium transition-all")}
          >
            <div
              className={
                (cn("m-1 h-full w-full rounded-lg"),
                index === activeIndex ? "border-b-2 border-orange-500" : "")
              }
            >
              {tab.label}
            </div>
          </button>
        ))}
      </div>
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
