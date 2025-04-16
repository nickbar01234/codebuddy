import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useOnMount } from "@cb/hooks";
import {
  disablePointerEvents,
  hideToRoot,
  waitForElement,
  waitForStableElements,
} from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";
import { SelectQuestionButton } from "./SelectProblemButton";

// We can afford to wait for a bit longer, since it's unlikely that user will complete question that quickly.
const TIMEOUT = 10_000;

interface QuestionSelectorPanelProps {
  handleQuestionSelect: (link: string) => void;
}

export const QuestionSelectorPanel = React.memo(
  ({ handleQuestionSelect }: QuestionSelectorPanelProps) => {
    const [loading, setLoading] = React.useState(true);
    useOnMount(() => {
      const handleIframeStyle = async (iframeDoc: Document) => {
        disablePointerEvents(iframeDoc);

        // A collection of questions - for some reason, leetcode has empty tables
        const table = await waitForElement(
          "div[role='table']:nth-child(1)",
          TIMEOUT,
          iframeDoc
        );
        hideToRoot(table);
        const rows = await waitForElement(
          "div[role='rowgroup']",
          TIMEOUT,
          table as unknown as Document
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const stableRows = await waitForStableElements("div[role='row']", {
          timeout: 4000,
          minCount: 5,
          root: rows,
          interval: 100,
        });
        // The order currently: status, title, solution, acceptance, difficulty, frequency
        const rowPromises = Array.from(stableRows ?? []).map(
          async (question) => {
            try {
              // Technically, the selector can either match on status (if daily question) or title -- in either cases,
              // we have the link to the actual problem
              const link = (await waitForElement(
                "div[role='cell'] a",
                TIMEOUT,
                question as unknown as Document
              )) as HTMLAnchorElement;
              const injected = iframeDoc.createElement("span");
              question.append(injected);
              createRoot(injected).render(
                <SelectQuestionButton
                  onClick={() => {
                    // Handle the question select
                    handleQuestionSelect(link.href);
                    // Prevent further action
                    return;
                  }}
                />
              );
            } catch (e) {
              console.error("Unable to inject button into question", e);
              // If no link exists, there's no point in displaying the question
              rows.removeChild(question);
            }
          }
        );

        await Promise.all(rowPromises);

        await waitForElement(
          "div[role='columnheader']:first-child",
          TIMEOUT,
          iframeDoc
        ).then((element) => {
          // todo(nickbar01234): Append an empty cell to make padding somewhat consistent... we should fix this styling
          const cloned = element.cloneNode(true);
          (cloned as HTMLElement).style.visibility = "hidden";
          element.parentNode?.appendChild(cloned);
        });
      };

      waitForElement("#leetcode_question", TIMEOUT).then((element) => {
        const iframe = element as HTMLIFrameElement;

        iframe.onload = async () => {
          const iframeDoc =
            iframe.contentDocument ?? iframe.contentWindow?.document;
          if (iframeDoc != undefined) {
            handleIframeStyle(iframeDoc)
              .then(() => {
                setLoading(false);
                console.log("Leetcode iframe mounted successfully");
              })
              .catch((e) => {
                console.error("Unable to mount Leetcode iframe", e);
              });
          }
        };
      });
    });

    return (
      <SkeletonWrapper
        loading={loading}
        className="w-[70vw] h-[60vh] bg-gray-700"
      >
        <iframe
          src="https://leetcode.com/problemset/"
          title="LeetCode Question"
          id="leetcode_question"
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </SkeletonWrapper>
    );
  }
);
