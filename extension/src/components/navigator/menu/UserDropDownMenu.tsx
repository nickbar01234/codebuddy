import { CaretDownIcon } from "@cb/components/icons";
import { Tooltip } from "@cb/components/tooltip";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { usePeerActions, usePeers, useRoomData } from "@cb/hooks/store";
import { DropdownMenuTrigger } from "@cb/lib/components/ui/dropdown-menu";
import {
  Identifiable,
  PeerState,
  Question,
  QuestionProgressStatus,
} from "@cb/types";
import { cn } from "@cb/utils/cn";
import { CircleCheckBig, CircleMinus, Code } from "lucide-react";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

interface UserDropDownMenuTriggerProps {
  peer?: Identifiable<PeerState>;
  canDropdown: boolean;
  question?: Question;
}

const STATUS_ICON_MAP: Record<QuestionProgressStatus, React.ReactNode> = {
  [QuestionProgressStatus.NOT_STARTED]: (
    <CircleMinus className="text-codebuddy-orange text-sm" size={16} />
  ),
  [QuestionProgressStatus.IN_PROGRESS]: (
    <Code className="text-codebuddy-blue text-sm" size={16} />
  ),
  [QuestionProgressStatus.COMPLETED]: (
    <CircleCheckBig className="text-codebuddy-green" size={16} />
  ),
};

const UserDropDownMenuTrigger = ({
  peer,
  canDropdown,
  question,
}: UserDropDownMenuTriggerProps) => {
  return (
    <div className="w-48">
      <SkeletonWrapper
        loading={peer == undefined}
        className="h-4 w-full relative"
      >
        <div className="flex w-full items-center">
          <DropdownMenuTrigger
            disabled={!canDropdown}
            className={cn(
              "relative flex justify-between rounded-lg items-center p-2 gap-1",
              {
                "hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-secondary":
                  canDropdown,
                "cursor-default": !canDropdown,
              }
            )}
          >
            <div className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm">
              <Tooltip
                trigger={{ node: <span>{peer?.id ?? ""}</span> }}
                content={peer?.id}
              />
            </div>
            {
              STATUS_ICON_MAP[
                peer?.questions[question?.url ?? ""]?.status ??
                  QuestionProgressStatus.NOT_STARTED
              ]
            }
            {canDropdown && <CaretDownIcon />}
          </DropdownMenuTrigger>
        </div>
      </SkeletonWrapper>
    </div>
  );
};

export const UserDropDownMenu = () => {
  const { currentQuestion } = useRoomData();
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
            question={currentQuestion}
          />
        ),
      }}
      content={{
        props: {
          className: "py-1 px-2",
        },
      }}
    >
      {currentQuestion && (
        <div className="text-tertiary border-b border-b-[--color-button-primary-border] mb-2">
          {currentQuestion.title}
        </div>
      )}
      {Object.entries(peers).map(([peer, state]) => (
        <DropdownMenuItem
          key={peer}
          onClick={() => selectPeer(peer)}
          disabled={selectedPeer?.id === peer}
          className="data-[disabled]:opacity-100"
        >
          <div
            className={cn("flex justify-between gap-2 items-center w-full", {
              "text-secondary": selectedPeer && selectedPeer.id !== peer,
            })}
          >
            <span>{peer}</span>
            {
              STATUS_ICON_MAP[
                state.questions[currentQuestion?.url ?? ""]?.status ??
                  QuestionProgressStatus.NOT_STARTED
              ]
            }
          </div>
        </DropdownMenuItem>
      ))}
    </Menu>
  );
};
