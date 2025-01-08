import { CaretDownIcon } from "@cb/components/icons";
import { usePeerSelection, useRTC } from "@cb/hooks/index";
import React from "react";
import { cn } from "@cb/utils/cn";

interface UserDropdownProps {
  isOpen: boolean;
  toggle: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

const GREENTHRESHOLD = 1250;
const YELLOWTHRESHOLD = 1400;

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, toggle }) => {
  const { activePeer, peers, setActivePeerId } = usePeerSelection();
  const { peerState } = useRTC();
  const ping = Math.round(peerState[activePeer?.id || ""]?.latency);
  const [isTooltipVisible, setTooltipVisible] = React.useState(false);
  const signalStrength = getStatus(ping);
  return (
    activePeer && (
      <div>
        <div className="flex items-center">
          <button
            data-dropdown-toggle="dropdown"
            className={cn(
              "font-medium has-tooltip rounded-lg text-sm px-3 py-2 text-center inline-flex items-center hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary relative"
            )}
            type="button"
            onClick={toggle}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >
            {activePeer.id} <CaretDownIcon />
            <span
              className={cn(
                "tooltip rounded shadow-lg p-1 whitespace-nowrap text-xs absolute font-bold left-full top-1/2 -translate-y-1/2",
                signalStrength.text
              )}
            >
              {ping !== null ? `${ping} ms` : "Error"}
            </span>
          </button>
          {!isTooltipVisible && (
            <div>
              <i
                className={cn(
                  " rounded-[4px] inline-flex items-end justify-end w-auto h-[24px] p-[4px] icon__signal-strength z-50 "
                )}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      `bar-${
                        i + 1
                      } inline-block w-[6px] ml-[2px] rounded-[2px]`,
                      signalStrength.bg +
                        " " +
                        (i + 1 > signalStrength.level ? "opacity-20" : "")
                    )}
                  ></span>
                ))}
              </i>
            </div>
          )}
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
function getStatus(ping: number | null) {
  const status =
    ping === null
      ? "red"
      : ping < GREENTHRESHOLD
      ? "green"
      : ping < YELLOWTHRESHOLD
      ? "yellow"
      : "red";

  const statusMapping = {
    red: { bg: "bg-red-500", text: "text-red-500", level: 1 },
    green: { bg: "bg-green-500", text: "text-green-500", level: 3 },
    yellow: { bg: "bg-yellow-500", text: "text-yellow-500", level: 2 },
  };

  return { status, ...statusMapping[status] };
}
export default UserDropdown;
