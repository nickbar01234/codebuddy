import { useOnMount } from "@cb/hooks";
import { useApp } from "@cb/store";
import { ContentRequest } from "@cb/types";

export const useContentScriptMessages = () => {
  const toggleEnabledApp = useApp((state) => state.actions.toggleEnabledApp);

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
