import { CaretDownIcon } from "@cb/components/icons";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { HEARTBEAT_INTERVAL } from "@cb/context/HeartBeatProvider";
import { usePeerSelection, useRTC } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import React from "react";

interface UserDropdownProps {
  isOpen: boolean;
  toggle: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

const GREENTHRESHOLD = HEARTBEAT_INTERVAL + 10;
const YELLOWTHRESHOLD = HEARTBEAT_INTERVAL * 1.25 + 10;

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, toggle }) => {
  const { activePeer, peers, setActivePeerId } = usePeerSelection();
  const { peerState } = useRTC();
  const ping = peerState[activePeer?.id ?? ""]?.latency * 1000;
  const signalStrength = getStatus(ping);
  const canDropdown = peers.length >= 2;

  return (
    <div className="w-48">
      <SkeletonWrapper loading={activePeer == undefined} className="h-4 w-44">
        <div className="flex w-44 items-center">
          <button
            data-dropdown-toggle="dropdown"
            className={cn(
              "relative inline-flex max-w-40 items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-lg p-2 text-center text-sm font-medium",
              {
                "hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary":
                  canDropdown,
                "cursor-default": !canDropdown,
              }
            )}
            type="button"
            onClick={toggle}
          >
            {activePeer?.id ?? "Unknown"}{" "}
            {peers.length > 1 && <CaretDownIcon />}
          </button>

          <div className="bar group relative flex h-full items-center justify-center">
            <i
              className={cn(
                "bar group-hover has-tooltip icon__signal-strength z-50 inline-flex h-[24px] w-auto items-end justify-end p-[4px]"
              )}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    `bar-${i + 1} ml-[2px] inline-block w-[6px] rounded-[2px]`,
                    signalStrength.bg,
                    i + 1 > signalStrength.level && "opacity-20"
                  )}
                />
              ))}
            </i>
          </div>
        </div>

        <div
          className={cn(
            "bg-layer-3 dark:bg-dark-layer-3 border-divider-4 dark:border-dark-divider-4 shadow-level1 dark:shadow-dark-level1 -transform-x-1/2 absolute z-50 w-44 divide-gray-100 rounded-lg shadow",
            isOpen && peers.length >= 2 ? "block" : "hidden"
          )}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {peers.map((peer) => (
              <li key={peer.id}>
                <a
                  onClick={() => setActivePeerId(peer.id)}
                  className="text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3 block px-4 py-2"
                >
                  {peer.id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </SkeletonWrapper>
    </div>
  );
};

function getStatus(ping: number) {
  const status =
    ping < GREENTHRESHOLD ? "green" : ping < YELLOWTHRESHOLD ? "yellow" : "red";
  const statusMapping = {
    red: { bg: "bg-red-500", text: "text-red-500", level: 1 },
    green: {
      bg: "bg-green-500",
      text: "text-green-500",
      level: 3,
    },
    yellow: {
      bg: "bg-yellow-500",
      text: "text-yellow-500",
      level: 2,
    },
  };
  return { status, ...statusMapping[status] };
}
export default UserDropdown;
