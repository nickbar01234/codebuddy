import React, { useState } from "react";
import { cn } from "@cb/utils/cn"; // Using your cn function

type TabItem = {
  label: React.ReactNode; // React component label
  content: React.ReactNode;
};

interface TabsProps {
  tabs: TabItem[];
  className?: string; // Optional className for the outermost div
}

export const Tabs: React.FC<TabsProps> = ({ tabs, className }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={cn("h-full w-full", className)}>
      <div className="">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn("px-4 py-2 text-sm font-medium transition-all")}
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
