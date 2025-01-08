import { CaretDownIcon } from "@cb/components/icons";
import { usePeerSelection, useRTC } from "@cb/hooks/index";
import React from "react";
import { cn } from "@cb/utils/cn";

interface UserDropdownProps {
  isOpen: boolean;
  toggle: (e: React.MouseEvent<Element, MouseEvent>) => void;
}
const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, toggle }) => {
  const { activePeer, peers, setActivePeerId } = usePeerSelection();
  const { peerState } = useRTC();
  const ping = Math.round(peerState[activePeer?.id || ""]?.latency);

  return (
    activePeer && (
      <div>
        <button
          data-dropdown-toggle="dropdown"
          className={cn(
            "font-medium has-tooltip rounded-lg text-sm px-3 py-2 text-center inline-flex items-center hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary relative"
          )}
          type="button"
          onClick={toggle}
        >
          {activePeer.id} <CaretDownIcon />
          <span
            className={cn(
              "tooltip rounded shadow-lg p-1 whitespace-nowrap text-xs absolute left-full ml-2 top-1/2 -translate-y-1/2",
              ping === null
                ? "text-red-500"
                : ping < 1300
                ? "text-green-500"
                : ping < 1500
                ? "text-yellow-500"
                : "text-red-500"
            )}
          >
            {ping !== null ? `${ping} ms` : "Error"}
          </span>
        </button>

        <div
          className={`absolute z-50 bg-layer-3 dark:bg-dark-layer-3 border-divider-4 dark:border-dark-divider-4 shadow-level1 dark:shadow-dark-level1 divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 left-0 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {peers.map((peer) => (
              <li key={peer.id}>
                <a
                  onClick={() => setActivePeerId(peer.id)}
                  className="block px-4 py-2 text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
                >
                  {peer.id}
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
