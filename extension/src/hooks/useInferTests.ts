import { DOM } from "@cb/constants";
import { waitForElement } from "@cb/utils";
import React from "react";
import { useOnMount } from ".";

const useInferTests = () => {
  const [variables, setVariables] = React.useState<string[]>([]);

  useOnMount(() => {
    waitForElement(DOM.PROBLEM_ID)
      .then((node) => node as HTMLElement)
      .then((node) => {
        const input = node.innerText.match(/.*Input:(.*)\n/);
        if (input != null) {
          setVariables(
            Array.from(input[1].matchAll(/(\w+)\s=/g)).map(
              (matched) => matched[1]
            )
          );
        }
      })
      .catch(() => console.error("Unable to determine test variables"));
  });

  return { variables };
};

export default useInferTests;
