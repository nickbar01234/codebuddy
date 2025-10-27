import { URLS } from "@cb/constants";
import { Switch } from "@cb/lib/components/ui/Switch";
import { useApp } from "@cb/store/appStore";
import React from "react";

export const ExtensionSwitch = () => {
  const enabled = useApp((state) => state.app.enabled);
  const toggleEnabledAppInternal = useApp(
    (state) => state.actions.toggleEnabledApp
  );

  // const [enabled, setEnabled] = React.useState(true);¡

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
      <div>
        <Switch checked={enabled} onCheckedChange={toggleEnabledApp} />
      </div>
    </div>
  );
};
