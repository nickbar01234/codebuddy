import React from "react";
import {
  BackIcon,
  CodeIcon,
  CopyIcon,
  PlusIcon,
  LeaveIcon,
} from "@cb/components/icons";
import { State, stateContext } from "@cb/context/StateProvider";
import { useRTC } from "@cb/hooks/index";
import { getQuestionIdFromUrl } from "@cb/utils";

interface MenuItem {
  display: string;
  icon: React.ReactNode;
  onClick: (e: unknown) => void;
}

interface MenuProps {
  displayMenu: boolean;
  setDisplayMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Menu = (props: MenuProps) => {
  const { displayMenu, setDisplayMenu } = props;
  const { state, setState } = React.useContext(stateContext);
  const { createRoom, joinRoom, roomId, leaveRoom } = useRTC();
  const [displayInputRoomId, setDisplayInputRoomId] = React.useState(false);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const items: MenuItem[] = React.useMemo(() => {
    if (state === State.HOME) {
      return [
        {
          display: "Create Room",
          icon: <PlusIcon />,
          onClick: () => {
            setState(State.ROOM);
            const questionId = getQuestionIdFromUrl(window.location.href);
            createRoom(questionId);
            setDisplayMenu(false);
          },
        },
        {
          display: "Join Room",
          icon: <CodeIcon />,
          onClick: () => setDisplayInputRoomId(true),
        },
      ];
    } else if (state === State.ROOM) {
      return [
        {
          display: "Copy room ID",
          icon: <CopyIcon />,
          onClick: () => {
            navigator.clipboard.writeText(roomId ?? "");
            setDisplayMenu(false);
          },
        },
        {
          display: "Leave Room",
          icon: <LeaveIcon />,
          onClick: () => {
            setState(State.HOME);
            setDisplayMenu(false);
            if (roomId) leaveRoom(roomId);
          },
        },
      ];
    }

    return [];
  }, [state, createRoom, setDisplayMenu, setState, roomId, leaveRoom]);

  React.useEffect(() => {
    if (roomId != null) {
      setState(State.ROOM);
    } else {
      setState(State.HOME);
    }
  }, [roomId, setState]);

  React.useEffect(() => {
    if (roomId != null) {
      setState(State.ROOM);
    } else {
      setState(State.HOME);
    }
  }, [roomId, setState]);

  if (!displayMenu) return null;

  return (
    <div
      className="bg-layer-3 dark:bg-dark-layer-3 border-divider-4 dark:border-dark-divider-4 shadow-level1 dark:shadow-dark-level1 absolute right-2 top-8 w-[200px] rounded-lg p-2 outline-none transform opacity-100 scale-100 z-50"
      role="menu"
      data-headlessui-state="open"
    >
      {displayInputRoomId ? (
        <React.Fragment>
          <div
            className="flex gap-x-1 items-center text-md w-full cursor-pointer select-none rounded px-3 py-[5px] text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
            role="menuitem"
            data-headlessui-state=""
            onClick={() => setDisplayInputRoomId(false)}
          >
            <BackIcon />
            <span>Back</span>
          </div>
          <div
            className="flex gap-x-1 px-3 py-[5px] items-center text-md w-full text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
            role="menuitem"
            data-headlessui-state=""
          >
            <PlusIcon
              onClick={async () => {
                const questionId = getQuestionIdFromUrl(window.location.href);
                const haveJoined = await joinRoom(inputRoomId, questionId);
                if (haveJoined) {
                  setState(State.ROOM);
                }
                setDisplayInputRoomId(false);
                setDisplayMenu(false);
              }}
            />
            <input
              className="w-full cursor-text rounded-lg border px-3 py-[5px] bg-fill-3 dark:bg-dark-fill-3 border-transparent"
              placeholder="Enter room ID"
              onChange={(e) => setInputRoomId(e.target.value)}
            />
          </div>
        </React.Fragment>
      ) : (
        items.map((item) => (
          <div
            key={item.display}
            className="flex gap-x-1 items-center text-md w-full cursor-pointer select-none rounded px-3 py-[5px] text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
            role="menuitem"
            data-headlessui-state=""
            onClick={item.onClick}
          >
            {item.icon}
            <span>{item.display}</span>
          </div>
        ))
      )}
    </div>
  );
};
