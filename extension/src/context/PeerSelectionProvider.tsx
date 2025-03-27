import { EDITOR_NODE_ID } from "@cb/components/panel/editor/EditorPanel";
import useInferTests from "@cb/hooks/useInferTests";
import {
  getLocalStorage,
  sendServiceRequest,
  setLocalStorage,
} from "@cb/services";
import { Peer, PeerInformation, ResponseStatus, TestCase } from "@cb/types";
import { poll } from "@cb/utils/poll";
import React from "react";
import { useOnMount, useRTC } from "../hooks";

const TIMER_WAIT_PAST_PEER_TO_SET_ACTIVE = 1000 * 5;

interface PeerSelectionContext {
  peers: Peer[];
  activePeer: Peer | undefined;
  setActivePeerId: (peer: string) => void;
  unblur: () => void;
  selectTest: (idx: number) => void;
  activeUserInformation: PeerInformation | undefined;
  pasteCode: () => void;
  setCode: (changeUser: boolean) => void;
  isBuffer: boolean;
}

export const PeerSelectionContext = React.createContext(
  {} as PeerSelectionContext
);

interface PeerSelectionProviderProps {
  children: React.ReactNode;
}

export const PeerSelectionProvider: React.FC<PeerSelectionProviderProps> = ({
  children,
}) => {
  const { informations, roomId, sessionId } = useRTC();
  const [peers, setPeers] = React.useState<Peer[]>([]);
  const [activePeer, setActivePeer] = React.useState<Peer>();
  const [changeUser, setChangeUser] = React.useState<boolean>(false);
  const [isBuffer, setIsBuffer] = React.useState<boolean>(true);
  const { variables } = useInferTests();

  const activeUserInformation = React.useMemo(
    () => (activePeer == undefined ? undefined : informations[activePeer?.id]),
    [informations, activePeer]
  );

  const replacePeer = React.useCallback(
    (
      id: string | undefined,
      override: ((peer: Peer) => Peer) | Partial<Peer>
    ) => {
      if (id != undefined) {
        const delegate = (peer: Peer) => {
          return typeof override === "function"
            ? override(peer)
            : { ...peer, ...override };
        };
        setPeers((prev) =>
          prev.map((peer) => (peer.id === id ? delegate(peer) : peer))
        );
      }
    },
    []
  );

  const groupTestCases = React.useCallback(
    (information: PeerInformation): TestCase[] => {
      const groups = (information.tests?.tests ?? []).reduce(
        (acc, test) => {
          // TODO(nickbar01234): Nasty implementation, but works
          const lastGroup = acc[acc.length - 1];
          if (lastGroup.length < variables.length) {
            lastGroup.push(test);
          } else {
            acc.push([test]);
          }
          return acc;
        },
        [[]] as Array<string[]>
      );
      return groups.map((group) => ({
        selected: false,
        test: group.map((assignment, idx) => ({
          variable: variables[idx],
          value: assignment,
        })),
      }));
    },
    [variables]
  );

  const findActivePeer = React.useCallback(
    () => peers.find((peer) => peer.active),
    [peers]
  );

  const unblur = React.useCallback(() => {
    replacePeer(activePeer?.id, { viewable: true });
  }, [activePeer, replacePeer]);

  const setActivePeerId = React.useCallback(
    (peer: string) => {
      // console.log("Change peer");
      replacePeer(activePeer?.id, { active: false });
      replacePeer(peer, { active: true });
      setChangeUser(true);
    },
    [activePeer, replacePeer]
  );

  const pasteCode = React.useCallback(() => {
    if (activeUserInformation != undefined) {
      sendServiceRequest({
        action: "pasteCode",
        value: activeUserInformation.code?.code.value ?? "",
      });
    }
  }, [activeUserInformation]);

  const setCode = React.useCallback(
    (changeUser: boolean) => {
      // console.log("Attempting to set code", activeUserInformation);
      if (activeUserInformation != undefined) {
        // console.log("Code", activeUserInformation);
        const {
          code: { value, language },
          changes,
        } = activeUserInformation.code ?? {
          code: {
            value: "",
            language: "",
          },
          changes: "",
        };
        sendServiceRequest({
          action: "setValueOtherEditor",
          code: value,
          language: language,
          changes: changes !== "" ? JSON.parse(changes) : {},
          changeUser: changeUser,
          editorId: EDITOR_NODE_ID,
        });
      }
    },
    [activeUserInformation]
  );

  const setCodeRef = React.useRef(setCode);

  const selectTest = React.useCallback(
    (idx: number) => {
      replacePeer(activePeer?.id, (peer) => {
        const updatedTests = peer.tests.map((test, currIdx) => ({
          ...test,
          selected: idx === currIdx,
        }));
        if (
          updatedTests.length > 0 &&
          updatedTests.find((test) => test.selected) == undefined
        ) {
          updatedTests[0].selected = true;
        }
        return { ...peer, tests: updatedTests };
      });
    },
    [activePeer, replacePeer]
  );

  const getLocalStorageForIndividualPeers = React.useCallback(
    (peerId: string) => {
      return getLocalStorage("tabs")?.sessions[sessionId].peers[peerId];
    },
    [sessionId]
  );

  const setLocalStorageForIndividualPeers = React.useCallback(
    (peer: Peer) => {
      if (!roomId) {
        return;
      }
      const currentInfo = getLocalStorage("tabs") ?? {
        roomId: roomId ?? "",
        sessions: {},
      };
      const currentRoom = currentInfo.sessions[sessionId ?? ""];
      if (!currentRoom) {
        currentInfo.sessions[sessionId ?? ""] = {
          sessionId: sessionId ?? "",
          peers: {},
        };
      }
      const currentPeers = currentInfo.sessions[sessionId].peers;
      currentPeers[peer.id] = {
        ...peer,
      };
      setLocalStorage("tabs", currentInfo);
    },
    [roomId, sessionId]
  );

  React.useEffect(() => {
    for (const peer of peers) {
      if (!isBuffer) {
        console.log("IS BUFFER DONE");
      }
      setLocalStorageForIndividualPeers(peer);
      if (peer.active) {
        setLocalStorage("lastActivePeer", peer.id);
      }
    }
  }, [peers, roomId, setLocalStorageForIndividualPeers, isBuffer]);

  React.useEffect(() => {
    setPeers((prev) =>
      Object.keys(informations).map((peerInfo) => {
        const prevPeer = getLocalStorageForIndividualPeers(peerInfo);
        const peerTab = prev.find((peer) => peer.id === peerInfo) ?? {
          id: peerInfo,
          active: false,
          viewable: (prevPeer && prevPeer.viewable) || false,
          tests: [],
        };
        const tests = groupTestCases(informations[peerInfo]);
        if (tests.length > 0) {
          // Check if peerTab has selected?
          // Otherwise, fallback to prevPeer
          // If prevPeer doesn't exist, select index 0
          const currentSelectedTest = peerTab.tests.findIndex(
            (test) => test.selected
          );
          const lastSelectedTest = prevPeer
            ? prevPeer.tests.findIndex((test: TestCase) => test.selected)
            : -1;
          const selectedTest = Math.max(
            currentSelectedTest,
            lastSelectedTest,
            0
          );
          tests[selectedTest].selected = true;
        }
        return { ...peerTab, tests };
      })
    );
  }, [informations, groupTestCases, getLocalStorageForIndividualPeers]);

  React.useEffect(() => setActivePeer(findActivePeer()), [findActivePeer]);

  React.useEffect(() => {
    if (activePeer === undefined && !isBuffer && peers.length > 0) {
      const lastActivePeer = getLocalStorage("lastActivePeer");
      if (lastActivePeer && peers.some((peer) => peer.id === lastActivePeer)) {
        setActivePeerId(lastActivePeer);
      } else {
        setActivePeerId(peers[0].id);
      }
    }
  }, [peers, activePeer, setActivePeerId, isBuffer]);

  React.useEffect(() => {
    if (activeUserInformation != undefined) {
      // console.log("Changeuser", changeUser, activeUserInformation);
      setCode(changeUser);
      setChangeUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeer?.id, activeUserInformation, setCode]); // not including changeUser

  React.useEffect(() => {
    setCodeRef.current = setCode;
  }, [setCode]);

  useOnMount(() => {
    poll({
      fn: () =>
        sendServiceRequest({
          action: "setupCodeBuddyModel",
          id: EDITOR_NODE_ID,
        }),
      until: (response) => response.status === ResponseStatus.SUCCESS,
    }).catch((e) => console.error("Error when setting up CodeBuddy model", e));
  });

  useOnMount(() => {
    const setPastActive = setTimeout(() => {
      setIsBuffer(false);
    }, TIMER_WAIT_PAST_PEER_TO_SET_ACTIVE);

    return () => clearTimeout(setPastActive);
  });

  return (
    <PeerSelectionContext.Provider
      value={{
        peers,
        activePeer,
        setActivePeerId,
        unblur,
        selectTest,
        activeUserInformation,
        pasteCode,
        setCode,
        isBuffer,
      }}
    >
      {children}
    </PeerSelectionContext.Provider>
  );
};
