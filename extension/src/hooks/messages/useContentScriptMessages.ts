import { useOnMount } from "@cb/hooks";
import { toggleEnabledApp } from "@cb/state/slices/layoutSlice";
import { store } from "@cb/state/store";
import { ContentRequest } from "@cb/types";

export const useContentScriptMessages = () => {
  useOnMount(() => {
    browser.runtime.onMessage.addListener((request: ContentRequest) => {
      switch (request.action) {
        case "toggleUi":
          store.dispatch(toggleEnabledApp());
          break;
      }
    });
  });
};
