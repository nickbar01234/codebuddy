import { sendServiceRequest } from "@cb/services";
import { ServiceResponse } from "@cb/types";
import { poll } from "@cb/utils/poll";
import React from "react";
import { useOnMount } from ".";

const useLanguageExtension = () => {
  const [languageExtensions, setLanguageExtensions] = React.useState<
    ServiceResponse["getLanguageExtension"]
  >([]);

  useOnMount(() => {
    poll({
      fn: async () => sendServiceRequest({ action: "getLanguageExtension" }),
      until: (response) => response instanceof Array && response.length > 0,
    }).then(setLanguageExtensions);
  });

  const getLanguageExtension = React.useCallback(
    (languageId?: string) =>
      languageExtensions.find((language) => language.id === languageId)
        ?.extensions[0],
    [languageExtensions]
  );

  return {
    getLanguageExtension,
  };
};

export default useLanguageExtension;
