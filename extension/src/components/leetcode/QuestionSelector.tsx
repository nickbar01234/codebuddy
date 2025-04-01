import SelectButtonQuestion from "@cb/components/button/SelectQuestionButton";
import { useOnMount } from "@cb/hooks";
import { disablePointerEvents, hideToRoot, waitForElement } from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";

// We can afford to wait for a bit longer, since it's unlikely that user will complete question that quickly.
const TIMEOUT = 10_000;

export const QuestionSelector = React.memo(
  ({
    handleQuestionSelect,
  }: {
    handleQuestionSelect: (questionLink: string) => void;
  }) => {
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
        // The order currently: status, title, solution, acceptance, difficulty, frequency
        rows?.querySelectorAll("div[role='row']").forEach(async (question) => {
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
              <SelectButtonQuestion
                onClick={() => {
                  // Handle the question select
                  handleQuestionSelect(link.href);
                  // Prevent further action
                  return;
                }}
              />
            );
          } catch {
            // If no link exist, there's no point in displaying the question
            rows.removeChild(question);
          }
        });

        waitForElement(
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
            handleIframeStyle(iframeDoc).catch((e) => {
              console.error("Unable to mount Leetcode iframe", e);
            });
          }
        };
      });
    });

    return (
      <iframe
        src="https://leetcode.com/problemset/"
        title="LeetCode Question"
        id="leetcode_question"
        className="z-100 h-full w-full"
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }
);
