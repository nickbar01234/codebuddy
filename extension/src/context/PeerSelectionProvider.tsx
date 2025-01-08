import { EDITOR_NODE_ID } from "@cb/components/panel/editor/EditorPanel";
import useInferTests from "@cb/hooks/useInferTests";
import { sendServiceRequest } from "@cb/services";
import { waitForElement } from "@cb/utils";
import React from "react";
import { useOnMount, useRTC } from "../hooks";
import { PeerInformation } from "./RTCProvider";

const TIMER_WAIT_PAST_PEER_TO_SET_ACTIVE = 1000 * 2;
interface PeerSelectionContext {
  peers: Peer[];
  activePeer: Peer | undefined;
  setActivePeerId: (peer: string) => void;
  unblur: () => void;
  selectTest: (idx: number) => void;
  activeUserInformation: PeerInformation | undefined;
  pasteCode: () => void;
  setCode: (changeUser: boolean) => void;
  loading: boolean;
}

export const PeerSelectionContext = React.createContext(
  {} as PeerSelectionContext
);

interface Assignment {
  variable: string;
  value: string;
}

interface TestCase {
  selected: boolean;
  test: Assignment[];
}

interface Peer {
  id: string;
  active: boolean;
  viewable: boolean;
  tests: TestCase[];
}

interface PeerSelectionProviderProps {
  children: React.ReactNode;
}

export const PeerSelectionProvider: React.FC<PeerSelectionProviderProps> = ({
  children,
}) => {
  const { informations, roomId } = useRTC();
  const [peers, setPeers] = React.useState<Peer[]>(
    JSON.parse(localStorage.getItem("tabs") || JSON.stringify({ peers: [] }))
      .peers
  );
  const [activePeer, setActivePeer] = React.useState<Peer>();
  const [changeUser, setChangeUser] = React.useState<boolean>(false);
  const [stillSettingPastActivePeer, setStillSettingPastActivePeer] =
    React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
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
        action: "setValue",
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
  const setLocalStorageForIndividualPeers = React.useCallback(
    (peer: Peer) => {
      localStorage.setItem(
        "tabs" + peer.id,
        JSON.stringify({ ...peer, roomId: roomId, lastSet: Date.now() })
      );
    },
    [roomId]
  );

  const getLocalStorageForIndividualPeers = React.useCallback(
    (peerId: string) => {
      const prevPeer = JSON.parse(
        localStorage.getItem("tabs" + peerId) || "{}"
      );
      if (Object.keys(prevPeer).length === 0) return undefined;

      const prevRoomId = prevPeer.roomId;
      if (roomId && prevRoomId != roomId) return undefined;

      return prevPeer;
    },
    [roomId]
  );

  React.useEffect(() => {
    if (!loading) {
      for (const peer of peers) {
        setLocalStorageForIndividualPeers(peer);
        if (peer.active && !stillSettingPastActivePeer) {
          localStorage.setItem("lastActivePeer", peer.id);
        }
      }
    }
  }, [
    peers,
    loading,
    roomId,
    setLocalStorageForIndividualPeers,
    stillSettingPastActivePeer,
  ]);

  React.useEffect(() => {
    console.log("Begin loading");
    setPeers((prev) =>
      Object.keys(informations).map((peerInfo) => {
        const prevPeer = getLocalStorageForIndividualPeers(peerInfo);
        const peerTab = prev.find((peer) => peer.id === peerInfo) ?? {
          id: peerInfo,
          active: false, // cannot set it here will conflict with the useEffect below
          viewable: (prevPeer && prevPeer.viewable) || false,
          tests: [],
        };
        const tests = groupTestCases(informations[peerInfo]);
        if (tests.length > 0) {
          let lastSelectedTest = peerTab.tests.findIndex(
            (test) => test.selected
          );
          if (lastSelectedTest == -1 && prevPeer) {
            lastSelectedTest = prevPeer.tests.findIndex(
              (test: TestCase) => test.selected
            );
          }
          const selectedTest = lastSelectedTest == -1 ? 0 : lastSelectedTest;
          tests[selectedTest].selected = true;
        }

        setLoading(false);
        return { ...peerTab, tests };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [informations, groupTestCases, roomId, getLocalStorageForIndividualPeers]); // add will create cyclic dependency

  React.useEffect(() => setActivePeer(findActivePeer()), [findActivePeer]);

  React.useEffect(() => {
    if (
      (activePeer === undefined || stillSettingPastActivePeer) &&
      peers.length > 0
    ) {
      const lastActivePeer = localStorage.getItem("lastActivePeer");
      if (lastActivePeer && peers.some((peer) => peer.id === lastActivePeer)) {
        setActivePeerId(lastActivePeer);
      } else {
        setActivePeerId(peers[0].id);
      }
    }
  }, [peers, activePeer, setActivePeerId, stillSettingPastActivePeer]);

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
    waitForElement(".monaco-editor", 2000)
      .then(() =>
        sendServiceRequest({
          action: "createModel",
          id: EDITOR_NODE_ID,
        })
      )
      .then(() => {
        // console.log("Created Model");
        setCodeRef.current(true);
      })
      .catch((error) => {
        console.error("Error during the process:", error);
      });
    const setPastActive = setTimeout(() => {
      setStillSettingPastActivePeer(false);
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
        loading,
        setCode,
      }}
    >
      {children}
    </PeerSelectionContext.Provider>
  );
};
