import { URLS } from "@cb/constants";
import { Switch } from "@cb/lib/components/ui/Switch";
import { useApp } from "@cb/store/appStore";
import React from "react";

export const ExtensionSwitch = () => {
  const enabled = useApp((state) => state.app.enabled);
  const toggleEnabledAppInternal = useApp(
    (state) => state.actions.toggleEnabledApp
  );

  const toggleEnabledApp = React.useCallback(() => {
    toggleEnabledAppInternal();
    browser.tabs.query({ url: URLS.ALL_PROBLEMS }).then((tabs) =>
      tabs.forEach((tab) => {
        if (tab.id != undefined) {
          browser.tabs.sendMessage(tab.id, { action: "toggleUi" });
        }
      })
    );
  }, [toggleEnabledAppInternal]);

  return (
    <div className="flex justify-between px-5 py-3">
      <div>Enable extension</div>
      <Switch
        checked={enabled}
        onCheckedChange={toggleEnabledApp}
        className="data-[state=checked]:bg-quaternary dark:data-[state=checked]:bg-quaternary data-[state=unchecked]:bg-quaternary dark:data-[state=unchecked]:bg-quaternary"
        thumbClassName="dark:data-[state=unchecked]:bg-ternary dark:data-[state=checked]:bg-ternary data-[state=unchecked]:bg-ternary data-[state=checked]:bg-ternary"
      />
    </div>
  );
};
