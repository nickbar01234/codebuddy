import type { RTCContext } from "@cb/context/RTCProvider";
import { sendServiceRequest } from "@cb/services";
import { set } from "mongoose";
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
  const [tabs, setTabs] = React.useState<Tab[]>(
    JSON.parse(localStorage.getItem("tabs") || "[]")
  );
  const [activeTab, setActiveTab] = React.useState<Tab>();
  const [changeUser, setChangeUser] = React.useState<boolean>(false);

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
        setTabs((prev) => {
          const newTabs = prev.map((tab) =>
            tab.id === id ? delegate(tab) : { ...tab }
          );
          return newTabs;
        });
      }
    },
    []
  );

  const findActiveTab = React.useCallback(
    () => tabs.find((tab) => tab.active),
    [tabs]
  );

  const unblur = React.useCallback(() => {
    replaceTab(activeTab?.id, { viewable: true });
  }, [activeTab, replaceTab]);

  const setActive = React.useCallback(
    (peer: string) => {
      replaceTab(activeTab?.id, { active: false });
      replaceTab(peer, { active: true });
      setChangeUser(true);
    },
    [activeTab, replaceTab]
  );

  const pasteCode = React.useCallback(() => {
    if (activeUserInformation != undefined) {
      sendServiceRequest({
        action: "setValue",
        value: activeUserInformation.code.code.value,
      });
    }
  }, [activeUserInformation]);

  const setCode = React.useCallback(
    (changeUser: boolean) => {
      if (activeUserInformation != undefined) {
        const {
          code: { value, language },
          changes,
        } = activeUserInformation.code;
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

  React.useEffect(() => {
    const prevTabs: Tab[] = JSON.parse(localStorage.getItem("tabs") || "[]");
    setTabs((prev) =>
      Object.keys(informations).map(
        (peer) =>
          prev.find((tab) => tab.id === peer) ?? {
            id: peer,
            active: false,
            viewable:
              prevTabs &&
              prevTabs.some((obj) => obj.id === peer) &&
              (prevTabs.find((obj) => obj.id === peer)?.viewable ?? false),
          }
      )
    );
  }, [informations]);

  React.useEffect(() => {
    if (activeTab == undefined && tabs.length > 0) {
      setActive(tabs[0].id);
    }
  }, [tabs, activeTab, setActive]);

  // React.useEffect(() => {
  //   if (tabs.length === 0) sendServiceRequest({ action: "cleanEditor" }); This line makes the code editor not persist throughout the session. I have added when the user clicks leave room that is when the editor get deleted.
  // }, [tabs]);

  React.useEffect(() => {
    const handleBeforeUnload = async () => {
      localStorage.setItem("tabs", JSON.stringify(tabs));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tabs]);

  React.useEffect(() => setActiveTab(findActiveTab()), [findActiveTab]);

  React.useEffect(() => {
    if (activeUserInformation != undefined) {
      setCode(changeUser);
      setChangeUser(false);
    }
  }, [activeTab?.id]);

  return {
    tabs,
    activeTab,
    unblur,
    setActive,
    activeUserInformation,
    pasteCode,
    setCode,
  };
};
