import { useRTC, useTab } from "@cb/hooks/index";
import React from "react";

interface UserDropdownProps {
  isOpen: boolean;
  toggle: (e: React.MouseEvent<Element, MouseEvent>) => void;
}
const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, toggle }) => {
  const { informations } = useRTC();
  const { activeTab, tabs, setActive } = useTab({
    informations,
  });

  return (
    activeTab && (
      <div className="relative">
        <button
          data-dropdown-toggle="dropdown"
          className="font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary"
          type="button"
          onClick={toggle}
        >
          {activeTab.id}{" "}
          <svg
            className="w-2.5 h-2.5 ms-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <div
          className={`absolute z-10 bg-layer-3 dark:bg-dark-layer-3 border-divider-4 dark:border-dark-divider-4 shadow-level1 dark:shadow-dark-level1 divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <a
                  onClick={() => setActive(tab.id)}
                  className="block px-4 py-2 text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
                >
                  {tab.id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
};

export default UserDropdown;
