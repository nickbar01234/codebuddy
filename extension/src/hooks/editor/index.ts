import { EDITOR_NODE_ID } from "@cb/components/panel/editor/EditorPanel";
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
          id: EDITOR_NODE_ID,
        }),
      until: (response) => response.status === ResponseStatus.SUCCESS,
    });
  });
};
