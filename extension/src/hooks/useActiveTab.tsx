import type { RTCContext } from "@cb/context/RTCProvider";
import { sendServiceRequest } from "@cb/services";
import React from "react";

interface UseActiveTabProps {
  informations: RTCContext["informations"];
}

interface Tab {
  id: string;
  active: boolean;
  viewable: boolean;
}

export const useTab = (props: UseActiveTabProps) => {
  const { informations } = props;
  const [tabs, setTabs] = React.useState<Tab[]>([]);
  const [activeTab, setActiveTab] = React.useState<Tab>();

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

  React.useEffect(() => {
    setTabs((prev) =>
      Object.keys(informations).map(
        (peer) =>
          prev.find((tab) => tab.id === peer) ?? {
            id: peer,
            active: false,
            viewable: false,
          }
      )
    );
  }, [informations]);

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
    if (activeUserInformation != undefined) {
      console.log("Triggering effect", activeUserInformation);
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

  return { tabs, activeTab, unblur, setActive };
};
