import useInferTests from "@cb/hooks/useInferTests";
import { sendServiceRequest } from "@cb/services";
import React from "react";
import { useRTC } from "../hooks";
import { PeerInformation } from "./RTCProvider";

interface PeerSelectionContext {
  peers: Peer[];
  activePeer: Peer | undefined;
  setActivePeerId: (peer: string) => void;
  unblur: () => void;
  selectTest: (idx: number) => void;
  activeUserInformation: PeerInformation | undefined;
  pasteCode: () => void;
  setCode: (changeUser: boolean) => void;
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
  const { informations } = useRTC();
  const [peers, setPeers] = React.useState<Peer[]>(
    JSON.parse(localStorage.getItem("tabs") || "[]")
  );
  const [activePeer, setActivePeer] = React.useState<Peer>();
  const [changeUser, setChangeUser] = React.useState<boolean>(false);
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

  const unblur = React.useCallback(
    () => replacePeer(activePeer?.id, { viewable: true }),
    [activePeer, replacePeer]
  );

  const setActivePeerId = React.useCallback(
    (peer: string) => {
      console.log("Change peer");
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
      console.log("Attempting to set code", activeUserInformation);
      if (activeUserInformation != undefined) {
        console.log("Code", activeUserInformation);
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

  React.useEffect(() => {
    const prevPeers: Peer[] = JSON.parse(localStorage.getItem("tabs") || "[]");
    setPeers((prev) =>
      Object.keys(informations).map((peerInfo) => {
        const peerTab = prev.find((peer) => peer.id === peerInfo) ?? {
          id: peerInfo,
          active: false,
          viewable:
            prevPeers.some((peer) => peer.id === peerInfo && peer.viewable) ??
            false,
          tests: [],
        };
        const tests = groupTestCases(informations[peerInfo]);
        if (tests.length > 0) {
          const lastSelectedTest = peerTab.tests.findIndex(
            (test) => test.selected
          );
          const selectedTest = lastSelectedTest == -1 ? 0 : lastSelectedTest;
          tests[selectedTest].selected = true;
        }
        console.log("Test cases", tests);
        return { ...peerTab, tests };
      })
    );
  }, [informations, groupTestCases]);

  React.useEffect(() => {
    if (activePeer == undefined && peers.length > 0) {
      setActivePeerId(peers[0].id);
    }
  }, [peers, activePeer, setActivePeerId]);

  React.useEffect(() => {
    const handleBeforeUnload = async () => {
      localStorage.setItem("tabs", JSON.stringify(peers));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [peers]);

  React.useEffect(() => setActivePeer(findActivePeer()), [findActivePeer]);

  React.useEffect(() => {
    if (activeUserInformation != undefined) {
      console.log("Changeuser", changeUser, activeUserInformation);
      setCode(changeUser);
      setChangeUser(false);
    }
  }, [activePeer?.id, activeUserInformation, setCode]);

  React.useEffect(() => {
    setCodeRef.current = setCode;
  }, [setCode]);

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
      }}
    >
      {children}
    </PeerSelectionContext.Provider>
  );
};
