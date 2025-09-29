import { CaretDownIcon } from "@cb/components/icons";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { usePeerActions, usePeers } from "@cb/hooks/store";
import { DropdownMenuTrigger } from "@cb/lib/components/ui/dropdown-menu";
import { Identifiable, PeerState } from "@cb/types";
import { cn } from "@cb/utils/cn";
import { codeViewable } from "@cb/utils/model";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";
interface UserDropDownMenuTriggerProps {
  peer?: Identifiable<PeerState>;
  canDropdown: boolean;
}

const UserDropDownMenuTrigger = ({
  peer,
  canDropdown,
}: UserDropDownMenuTriggerProps) => {
  return (
    <div className="w-36">
      <SkeletonWrapper
        loading={peer == undefined}
        className="h-4 w-full relative"
      >
        <div className="flex w-full items-center">
          <DropdownMenuTrigger
            disabled={!canDropdown}
            className={cn(
              "relative flex justify-between rounded-lg items-center p-2",
              {
                "hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary":
                  canDropdown,
                "cursor-default": !canDropdown,
                "pointer-events-none": !codeViewable(peer),
              }
            )}
          >
            <div className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm">
              {peer?.id ?? ""}
            </div>
            {canDropdown && <CaretDownIcon />}
          </DropdownMenuTrigger>
        </div>
      </SkeletonWrapper>
    </div>
  );
};

export const UserDropDownMenu = () => {
  const { peers, selectedPeer } = usePeers();
  const { selectPeer } = usePeerActions();
  const canDropdown = Object.keys(peers).length >= 2;

  return (
    <Menu
      trigger={{
        props: { disabled: !canDropdown },
        customTrigger: true,
        node: (
          <UserDropDownMenuTrigger
            peer={selectedPeer}
            canDropdown={canDropdown}
          />
        ),
      }}
    >
      {Object.keys(peers).map((peer) => (
        <DropdownMenuItem key={peer} onClick={() => selectPeer(peer)}>
          {peer}
        </DropdownMenuItem>
      ))}
    </Menu>
  );
};
