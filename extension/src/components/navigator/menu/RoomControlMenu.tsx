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
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { getQuestionIdFromUrl } from "@cb/utils";
import { clearLocalStorage } from "@cb/services";

interface MenuItem {
  display: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

interface RoomControlMenuProps {
  displayMenu: boolean;
  setDisplayMenu: (value: boolean) => void;
}

export const RoomControlMenu: React.FC<RoomControlMenuProps> = ({
  displayMenu,
  setDisplayMenu,
}) => {
  const { state: appState, setState: setAppState } =
    React.useContext(appStateContext);
  const { createRoom, joinRoom, roomId, leaveRoom } = useRTC();
  const [displayInputRoomId, setDisplayInputRoomId] = React.useState(false);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const items: MenuItem[] = React.useMemo(() => {
    if (appState === AppState.HOME) {
      return [
        {
          display: "Create Room",
          icon: <PlusIcon />,
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            e.stopPropagation();
            setAppState(AppState.ROOM);
            const questionId = getQuestionIdFromUrl(window.location.href);
            createRoom(questionId);
            setDisplayMenu(false);
          },
        },
        {
          display: "Join Room",
          icon: <CodeIcon />,
          onClick: (
            e:
              | React.MouseEvent<Element, MouseEvent>
              | React.KeyboardEvent<Element>
          ) => {
            e.stopPropagation();

            // Check if the event is a mouse click or an Enter key press
            if (
              e.type === "click" ||
              (e.type === "keydown" &&
                (e as React.KeyboardEvent).key === "Enter")
            ) {
              setDisplayInputRoomId(true);
            }
          },
        },
        {
          display: "Reset Extension",
          icon: <ResetIcon />,
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            e.stopPropagation();
            clearLocalStorage();
            setDisplayMenu(false);
          },
        },
      ];
    } else if (appState === AppState.ROOM) {
      return [
        {
          display: "Copy room ID",
          icon: <CopyIcon />,
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            e.stopPropagation();
            navigator.clipboard.writeText(roomId ?? "");
            setDisplayMenu(false);
          },
        },
        {
          display: "Leave Room",
          icon: <LeaveIcon />,
          onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
            e.stopPropagation();
            setAppState(AppState.HOME);
            setDisplayMenu(false);
            if (roomId) leaveRoom(roomId);
          },
        },
      ];
    }

    return [];
  }, [appState, createRoom, setDisplayMenu, setAppState, roomId, leaveRoom]);

  React.useEffect(() => {
    if (roomId != null) {
      setAppState(AppState.ROOM);
    } else {
      setAppState(AppState.HOME);
    }
  }, [roomId, setAppState]);

  React.useEffect(() => {
    if (roomId != null) {
      setAppState(AppState.ROOM);
    } else {
      setAppState(AppState.HOME);
    }
  }, [roomId, setAppState]);

  const toggleDisplayMenu = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setDisplayMenu(!displayMenu);
  };

  const onBackButtonClick = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setDisplayInputRoomId(false);
  };

  const onJoinRoom = async (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => {
    e.stopPropagation();
    const questionId = getQuestionIdFromUrl(window.location.href);
    const haveJoined = await joinRoom(inputRoomId, questionId);
    if (haveJoined) {
      setAppState(AppState.ROOM);
    }
    setDisplayInputRoomId(false);
    setDisplayMenu(false);
  };

  const onClickRoomIdInput = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };
  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  return (
    <div>
      <button
        className="hover:text-label-1 dark:hover:text-dark-label-1 flex cursor-pointer items-center justify-center rounded-md w-6 h-6 hover:bg-fill-secondary p-1"
        id="headlessui-menu-button-:r3q:"
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
        data-headlessui-appState=""
        onClick={toggleDisplayMenu}
      >
        <MenuIcon />
      </button>

      <div
        className={`bg-layer-3 dark:bg-dark-layer-3 border-divider-4 dark:border-dark-divider-4 shadow-level1 dark:shadow-dark-level1 absolute right-0 top-8 w-[200px] rounded-lg p-2 outline-none transform opacity-100 scale-100 z-50 ${
          displayMenu ? "block" : "hidden"
        }`}
        role="menu"
        data-headlessui-appState="open"
      >
        {displayInputRoomId ? (
          <React.Fragment>
            <div
              className="flex gap-x-1 items-center text-md w-full cursor-pointer select-none rounded px-3 py-[5px] text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
              role="menuitem"
              data-headlessui-appState=""
              onClick={onBackButtonClick}
            >
              <BackIcon />
              <span>Back</span>
            </div>
            <div
              className="flex gap-x-1 px-3 py-[5px] items-center text-md w-full text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
              role="menuitem"
              data-headlessui-appState=""
            >
              <PlusIcon onClick={onJoinRoom} />
              <input
                className="w-full cursor-text rounded-lg border px-3 py-[5px] bg-fill-3 dark:bg-dark-fill-3 border-transparent"
                placeholder="Enter room ID"
                onClick={onClickRoomIdInput}
                onChange={onChangeRoomIdInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onJoinRoom(e as React.KeyboardEvent<Element>);
                  } // Trigger the join room action
                }}
              />
            </div>
          </React.Fragment>
        ) : (
          items.map((item) => (
            <div
              key={item.display}
              className="flex gap-x-1 items-center text-md w-full cursor-pointer select-none rounded px-3 py-[5px] text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
              role="menuitem"
              data-headlessui-appState=""
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
