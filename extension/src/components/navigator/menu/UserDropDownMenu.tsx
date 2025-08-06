import { CaretDownIcon } from "@cb/components/icons";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { HEARTBEAT_INTERVAL } from "@cb/context/RTCProvider";
import { usePeerSelection } from "@cb/hooks";
import { useInRoom } from "@cb/hooks/store";
import { DropdownMenuTrigger } from "@cb/lib/components/ui/dropdown-menu";
import { Peer } from "@cb/types";
import { cn } from "@cb/utils/cn";
import { codeViewable } from "@cb/utils/model";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

const GREENTHRESHOLD = HEARTBEAT_INTERVAL + 10;
const YELLOWTHRESHOLD = HEARTBEAT_INTERVAL * 1.25 + 10;

interface UserDropDownMenuTriggerProps {
  peer?: Peer;
  canDropdown: boolean;
  signalStrength: ReturnType<typeof getStatus>;
}

const UserDropDownMenuTrigger = ({
  peer,
  canDropdown,
  signalStrength,
}: UserDropDownMenuTriggerProps) => {
  return (
    <div className="w-52">
      <SkeletonWrapper
        loading={peer == undefined}
        className="h-4 w-48 relative"
      >
        <div className="flex w-48 items-center">
          <DropdownMenuTrigger
            disabled={!canDropdown}
            className={cn(
              "relative flex justify-between rounded-lg p-2 items-center",
              {
                "hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary":
                  canDropdown,
                "cursor-default": !canDropdown,
                "pointer-events-none": !codeViewable(peer),
              }
            )}
          >
            <div className="max-w-44 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm">
              {peer?.id ?? ""}
            </div>
            {canDropdown && <CaretDownIcon />}
          </DropdownMenuTrigger>
          <div className="bar group relative flex h-full items-center justify-center">
            <i
              className={cn(
                "bar group-hover has-tooltip icon__signal-strength z-50 inline-flex h-[24px] w-auto items-end justify-end p-1"
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
      </SkeletonWrapper>
    </div>
  );
};

export const UserDropDownMenu = () => {
  const { activePeer, setActivePeerId } = usePeerSelection();
  const { peers } = useInRoom();
  const ping = peers[activePeer?.id ?? ""]?.latency * 1000;
  const canDropdown = Object.keys(peers).length >= 2;

  return (
    <Menu
      trigger={{
        props: { disabled: !canDropdown },
        customTrigger: true,
        node: (
          <UserDropDownMenuTrigger
            peer={activePeer}
            canDropdown={canDropdown}
            signalStrength={getStatus(ping)}
          />
        ),
      }}
    >
      {Object.keys(peers).map((peer) => (
        <DropdownMenuItem key={peer} onClick={() => setActivePeerId(peer)}>
          {peer}
        </DropdownMenuItem>
      ))}
    </Menu>
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
