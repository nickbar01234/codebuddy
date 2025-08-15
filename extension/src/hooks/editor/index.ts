import { DOM } from "@cb/constants";
import { sendServiceRequest } from "@cb/services";
import { ResponseStatus } from "@cb/types";

export const useMonacoSetup = () => {
  useOnMount(() => {
    poll({
      fn: () => sendServiceRequest({ action: "setupLeetCodeModel" }),
      until: (response) => response.status === ResponseStatus.SUCCESS,
    });
  });

  useOnMount(() => {
    poll({
      fn: () =>
        sendServiceRequest({
          action: "setupCodeBuddyModel",
          id: DOM.CODEBUDDY_EDITOR_ID,
        }),
      until: (response) => response.status === ResponseStatus.SUCCESS,
    });
  });
};
