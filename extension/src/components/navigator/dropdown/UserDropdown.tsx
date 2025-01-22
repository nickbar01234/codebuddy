import { CaretDownIcon } from "@cb/components/icons";
import { usePeerSelection, useRTC } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import React from "react";

interface UserDropdownProps {
  isOpen: boolean;
  toggle: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

const GREENTHRESHOLD = 1150;
const YELLOWTHRESHOLD = 1300;

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, toggle }) => {
  const { activePeer, peers, setActivePeerId } = usePeerSelection();
  const { peerState } = useRTC();
  const ping = Math.round(peerState[activePeer?.id ?? ""]?.latency);
  const signalStrength = getStatus(ping);
  return (
    activePeer && (
      <div>
        <div className="flex items-center">
          <button
            data-dropdown-toggle="dropdown"
            className={cn(
              "font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary relative"
            )}
            type="button"
            onClick={toggle}
          >
            {activePeer.id} {peers.length > 1 && <CaretDownIcon />}
          </button>

          <div className="bar group h-full flex items-center justify-center relative">
            <i
              className={cn(
                "bar group-hover has-tooltip inline-flex items-end justify-end w-auto h-[24px] p-[4px] z-50 icon__signal-strength"
              )}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    `bar-${i + 1} inline-block w-[6px] ml-[2px] rounded-[2px]`,
                    signalStrength.bg,
                    i + 1 > signalStrength.level && "opacity-20"
                  )}
                ></span>
              ))}
            </i>
            <span
              className={cn(
                `shadow-lg whitespace-nowrap text-xs font-bold
                   left-full  absolute z-50 ml-1  w-min
                   invisible
                    -translate-x-4 text-nowrap
                  transition-all group-hover:visible group-hover:translate-x-0 
                  group-hover:opacity-100`,
                signalStrength.text
              )}
            >
              {signalStrength.title}
            </span>
          </div>
        </div>

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
function getStatus(ping: number) {
  const status =
    ping < GREENTHRESHOLD ? "green" : ping < YELLOWTHRESHOLD ? "yellow" : "red";

  const statusMapping = {
    red: { bg: "bg-red-500", text: "text-red-500", level: 1, title: "Error" },
    green: {
      bg: "bg-green-500",
      text: "text-green-500",
      level: 3,
      title: "Good",
    },
    yellow: {
      bg: "bg-yellow-500",
      text: "text-yellow-500",
      level: 2,
      title: "Okay",
    },
  };

  return { status, ...statusMapping[status] };
}
export default UserDropdown;
