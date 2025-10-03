import { CSS } from "@cb/constants";
import { useApp, useRoom } from "@cb/store";
import { useHtml } from "@cb/store/htmlStore";
import { useLeetCode } from "@cb/store/leetCodeStore";
import { User } from "@cb/types";
import React from "react";
import { useShallow } from "zustand/shallow";

export const useAuthUser = () => useApp((state) => state.actions.getAuthUser());

export const useAppPreference = () => useApp((state) => state.app);

export const usePeers = () => {
  const peers = useRoom((state) => state.peers);
  const selectedPeer = React.useMemo(() => getSelectedPeer(peers), [peers]);
  const maybeAuthUser = useApp((state) => state.actions.getMaybeAuthUser());
  const allPeers = useRoom(
    useShallow((state) => {
      const peers = state.peers;
      if (maybeAuthUser != undefined) {
        return { ...peers, [maybeAuthUser.username]: state.self };
      }
      return peers;
    })
  );
  return {
    peers,
    allPeers,
    selectedPeer,
  };
};

export const useRoomStatus = () => useRoom((state) => state.status);

export interface UserMedata {
  user: User;
  css: (typeof CSS)["USER_ICON_CSS"][number];
  solved: number;
  url?: string;
}

export const useRoomData = () => {
  const questions = useRoom(useShallow((state) => state.room?.questions ?? []));
  const name = useRoom((state) => state.room?.name);
  const id = useRoom((state) => state.room?.id);
  const activeSidebarTab = useRoom((state) => state.room?.activeSidebarTab);
  const usernames = useRoom(useShallow((state) => state.room?.usernames ?? []));
  const { allPeers } = usePeers();
  return {
    name,
    questions,
    id,
    activeSidebarTab,
    users: usernames
      .filter((user) => Object.keys(allPeers).includes(user))
      .map(
        (user, idx) =>
          ({
            user,
            css: CSS["USER_ICON_CSS"][idx],
            solved: 0,
            url: allPeers[user]?.url,
          }) as UserMedata
      ),
  };
};

export const useRoomActions = () => useRoom((state) => state.actions.room);

export const usePeerActions = () => useRoom((state) => state.actions.peers);

export const useLeetCodeActions = () => useLeetCode((state) => state.actions);

export const useAuthActions = () => {
  const authenticate = useApp((state) => state.actions.authenticate);
  const unauthenticate = useApp((state) => state.actions.unauthenticate);
  const getAuthUser = useApp((state) => state.actions.getAuthUser);
  return { authenticate, unauthenticate, getAuthUser };
};

export const useAppActions = ({ panelRef }: any) => {
  const handleDoubleClick = (collapsed: boolean) => {
    if (collapsed) {
      panelRef.current?.expand();
    } else {
      panelRef.current?.collapse();
    }
  };
  const collapseExtension = useApp((state) => state.actions.collapseExtension);
  const expandExtension = useApp((state) => state.actions.expandExtension);
  const setAppWidth = useApp((state) => state.actions.setAppWidth);
  return { collapseExtension, expandExtension, setAppWidth, handleDoubleClick };
};

export const useHtmlActions = () => useHtml((state) => state.actions);

export const useHtmlElement = () => useHtml((state) => state.htmlElement);
