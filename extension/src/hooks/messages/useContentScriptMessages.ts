import { useOnMount } from "@cb/hooks";
import { usePreference } from "@cb/store";
import { ContentRequest } from "@cb/types";

export const useContentScriptMessages = () => {
  const toggleEnabledApp = usePreference(
    (state) => state.actions.toggleEnabledApp
  );

  useOnMount(() => {
    browser.runtime.onMessage.addListener((request: ContentRequest) => {
      switch (request.action) {
        case "toggleUi":
          toggleEnabledApp();
          break;
      }
    });
  });
};
