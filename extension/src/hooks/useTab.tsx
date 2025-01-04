import type { PeerInformation, RTCContext } from "@cb/context/RTCProvider";
import { sendServiceRequest } from "@cb/services";
import React from "react";
import useInferTests from "./useInferTests";

interface UseActiveTabProps {
  informations: RTCContext["informations"];
}

interface Assignment {
  variable: string;
  value: string;
}

interface TestCase {
  selected: boolean;
  test: Assignment[];
}

interface Tab {
  id: string;
  active: boolean;
  viewable: boolean;
  tests: TestCase[];
}

export const useTab = (props: UseActiveTabProps) => {
  const { informations } = props;
  const [tabs, setTabs] = React.useState<Tab[]>([]);
  const [activeTab, setActiveTab] = React.useState<Tab>();
  const { variables } = useInferTests();

  const activeUserInformation = React.useMemo(
    () => (activeTab == undefined ? undefined : informations[activeTab?.id]),
    [informations, activeTab]
  );

  const replaceTab = React.useCallback(
    (id: string | undefined, override: ((tab: Tab) => Tab) | Partial<Tab>) => {
      if (id != undefined) {
        const delegate = (tab: Tab) => {
          return typeof override === "function"
            ? override(tab)
            : { ...tab, ...override };
        };
        setTabs((prev) =>
          prev.map((tab) => (tab.id === id ? delegate(tab) : { ...tab }))
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

  const findActiveTab = React.useCallback(
    () => tabs.find((tab) => tab.active),
    [tabs]
  );

  const unblur = React.useCallback(
    () => replaceTab(activeTab?.id, { viewable: true }),
    [activeTab, replaceTab]
  );

  const setActive = React.useCallback(
    (peer: string) => {
      replaceTab(activeTab?.id, { active: false });
      replaceTab(peer, { active: true });
    },
    [activeTab, replaceTab]
  );

  const selectTest = React.useCallback(
    (idx: number) => {
      replaceTab(activeTab?.id, (tab) => {
        const updatedTests = tab.tests.map((test, currIdx) => ({
          ...test,
          selected: idx === currIdx,
        }));
        if (
          updatedTests.length > 0 &&
          updatedTests.find((test) => test.selected) == undefined
        ) {
          updatedTests[0].selected = true;
        }
        return { ...tab, tests: updatedTests };
      });
    },
    [activeTab, replaceTab]
  );

  React.useEffect(() => {
    setTabs((prev) =>
      Object.keys(informations).map((peer) => {
        const peerTab = prev.find((tab) => tab.id === peer) ?? {
          id: peer,
          active: false,
          viewable: false,
          tests: [],
        };
        const tests = groupTestCases(informations[peer]);
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
    if (activeTab == undefined && tabs.length > 0) {
      setActive(tabs[0].id);
    }
  }, [tabs, activeTab, setActive]);

  React.useEffect(() => {
    if (tabs.length === 0) sendServiceRequest({ action: "cleanEditor" });
  }, [tabs]);

  React.useEffect(() => setActiveTab(findActiveTab()), [findActiveTab]);

  React.useEffect(() => {
    if (activeUserInformation?.code != undefined) {
      const {
        code: { value, language },
        changes,
      } = activeUserInformation.code;
      sendServiceRequest({
        action: "setValueOtherEditor",
        code: value,
        language: language,
        changes: changes !== "" ? JSON.parse(changes) : {},
        changeUser: false,
      });
    }
  }, [activeUserInformation]);

  return { tabs, activeTab, unblur, setActive, selectTest };
};
