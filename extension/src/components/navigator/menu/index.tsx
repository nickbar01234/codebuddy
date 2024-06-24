import { State, stateContext } from "@cb/context/StateProvider";
import { useRTC } from "@cb/hooks/index";
import React from "react";
import { toast } from "sonner";
import { getQuestionIdFromUrl } from "@cb/utils/url";

interface MenuItem {
  display: string;
  icon: React.ReactNode;
  onClick: (e: unknown) => void;
}

interface MenuProps {
  displayMenu: boolean;
  setDisplayMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = (props: MenuProps) => {
  const { displayMenu, setDisplayMenu } = props;
  const { state, setState } = React.useContext(stateContext);
  const { createRoom, joinRoom, roomId } = useRTC();
  const [displayInputRoomId, setDisplayInputRoomId] = React.useState(false);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const items: MenuItem[] = React.useMemo(() => {
    if (state === State.HOME) {
      return [
        {
          display: "Create Room",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fill-rule="evenodd"
                d="M13 11h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 112 0v7z"
                clip-rule="evenodd"
              />
            </svg>
          ),
          onClick: () => {
            setState(State.ROOM);
            const questionId = getQuestionIdFromUrl(window.location.href);
            createRoom(questionId);
            setDisplayMenu(false);
          },
        },
        {
          display: "Join Room",
          icon: (
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="code"
              className="h-4 w-4 svg-inline--fa fa-code"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
              width="1em"
              height="1em"
              fill="currentColor"
            >
              <path
                fill="currentColor"
                d="M399.1 1.1c-12.7-3.9-26.1 3.1-30 15.8l-144 464c-3.9 12.7 3.1 26.1 15.8 30s26.1-3.1 30-15.8l144-464c3.9-12.7-3.1-26.1-15.8-30zm71.4 118.5c-9.1 9.7-8.6 24.9 1.1 33.9L580.9 256 471.6 358.5c-9.7 9.1-10.2 24.3-1.1 33.9s24.3 10.2 33.9 1.1l128-120c4.8-4.5 7.6-10.9 7.6-17.5s-2.7-13-7.6-17.5l-128-120c-9.7-9.1-24.9-8.6-33.9 1.1zm-301 0c-9.1-9.7-24.3-10.2-33.9-1.1l-128 120C2.7 243 0 249.4 0 256s2.7 13 7.6 17.5l128 120c9.7 9.1 24.9 8.6 33.9-1.1s8.6-24.9-1.1-33.9L59.1 256 168.4 153.5c9.7-9.1 10.2-24.3 1.1-33.9z"
              />
            </svg>
          ),
          onClick: () => setDisplayInputRoomId(true),
        },
      ];
    } else if (state === State.ROOM) {
      return [
        {
          display: "Copy room ID",
          icon: (
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="clone"
              className="svg-inline--fa fa-clone"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"
              />
            </svg>
          ),
          onClick: () => {
            navigator.clipboard.writeText(roomId ?? "");
            setDisplayMenu(false);
          },
        },
      ];
    }

    return [];
  }, [state, createRoom, setDisplayMenu, setState, roomId]);

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
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="chevron-left"
              className="svg-inline--fa fa-chevron-left"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path
                fill="currentColor"
                d="M15 239c-9.4 9.4-9.4 24.6 0 33.9L207 465c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L65.9 256 241 81c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15 239z"
              />
            </svg>
            <span>Back</span>
          </div>
          <div
            className="flex gap-x-1 px-3 py-[5px] items-center text-md w-full text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
            role="menuitem"
            data-headlessui-state=""
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="currentColor"
              className="h-4 w-4 cursor-pointer hover:text-label-1 dark:hover:text-dark-label-1 hover:bg-fill-3 dark:hover:bg-dark-fill-3"
              onClick={async () => {
                const questionId = getQuestionIdFromUrl(window.location.href);
                const haveJoined = await joinRoom(inputRoomId, questionId);
                if (haveJoined) {
                  setState(State.ROOM);
                }
                setDisplayInputRoomId(false);
                setDisplayMenu(false);
              }}
            >
              <path
                fill-rule="evenodd"
                d="M13 11h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 112 0v7z"
                clip-rule="evenodd"
              />
            </svg>
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

export default Menu;
