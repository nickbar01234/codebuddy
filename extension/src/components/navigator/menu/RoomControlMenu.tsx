import React from "react";
import {
  BackIcon,
  CodeIcon,
  CopyIcon,
  PlusIcon,
  LeaveIcon,
  MenuIcon,
  ResetIcon,
} from "@cb/components/icons";
import { State, stateContext } from "@cb/context/StateProvider";
import { useRTC } from "@cb/hooks/index";
import { getQuestionIdFromUrl } from "@cb/utils";

interface MenuItem {
  display: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

interface RoomControlMenuProps {
  displayMenu: boolean;
  setDisplayMenu: (
    e: React.MouseEvent<Element, MouseEvent>,
    value: boolean
  ) => void;
}

export const RoomControlMenu: React.FC<RoomControlMenuProps> = ({
  displayMenu,
  setDisplayMenu,
}) => {
  const { state, setState } = React.useContext(stateContext);
  const { createRoom, joinRoom, roomId, leaveRoom } = useRTC();
  const [displayInputRoomId, setDisplayInputRoomId] = React.useState(false);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const items: MenuItem[] = React.useMemo(() => {
    if (state === State.HOME) {
      return [
        {
          display: "Reset Extension",
          icon: <ResetIcon />,
          onClick: () => {
            localStorage.clear();
          },
        },
        {
          display: "Create Room",
          icon: <PlusIcon />,
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            setState(State.ROOM);
            const questionId = getQuestionIdFromUrl(window.location.href);
            createRoom(questionId);
            setDisplayMenu(e, false);
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
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            navigator.clipboard.writeText(roomId ?? "");
            setDisplayMenu(e, false);
          },
        },
        {
          display: "Leave Room",
          icon: <LeaveIcon />,
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            setState(State.HOME);
            setDisplayMenu(e, false);
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

  const toggleDisplayMenu = (e: React.MouseEvent<Element, MouseEvent>) =>
    setDisplayMenu(e, !displayMenu);

  return (
    <div className="relative">
      <button
        className="hover:text-label-1 dark:hover:text-dark-label-1 flex cursor-pointer items-center justify-center rounded-md w-6 h-6 hover:bg-fill-secondary p-1"
        id="headlessui-menu-button-:r3q:"
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
        data-headlessui-state=""
        onClick={toggleDisplayMenu}
      >
        <MenuIcon />
      </button>

      <div
        className={`bg-layer-3 dark:bg-dark-layer-3 border-divider-4 dark:border-dark-divider-4 shadow-level1 dark:shadow-dark-level1 absolute right-0 top-8 w-[200px] rounded-lg p-2 outline-none transform opacity-100 scale-100 z-50 ${
          displayMenu ? "block" : "hidden"
        }`}
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
                onClick={async (e: React.MouseEvent<Element, MouseEvent>) => {
                  const questionId = getQuestionIdFromUrl(window.location.href);
                  const haveJoined = await joinRoom(inputRoomId, questionId);
                  if (haveJoined) {
                    setState(State.ROOM);
                  }
                  setDisplayInputRoomId(false);
                  setDisplayMenu(e, false);
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
    </div>
  );
};
