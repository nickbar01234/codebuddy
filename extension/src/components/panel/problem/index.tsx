import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import useResource from "@cb/hooks/useResource";
import {
  disablePointerEvents,
  generateId,
  getQuestionIdFromUrl,
  hideToRoot,
  waitForElement,
} from "@cb/utils";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SelectQuestionButton } from "./SelectProblemButton";

// We can afford to wait for a bit longer, since it's unlikely that user will complete question that quickly.
const TIMEOUT = 10_000;

const INJECTED_ATTRIBUTE = "data-injected";

interface QuestionSelectorPanelProps {
  handleQuestionSelect: (link: string) => void;
  filterQuestionIds: string[];
  container?: Omit<SkelentonWrapperProps, "loading">;
}

export const QuestionSelectorPanel = React.memo(
  ({
    handleQuestionSelect,
    filterQuestionIds,
    container = {},
  }: QuestionSelectorPanelProps) => {
    const [loading, setLoading] = React.useState(true);
    const { register: registerObserver } = useResource<MutationObserver>({
      name: "observer",
    });

    const devMode = true;

    useEffect(() => {
      const handleIframeStyle = async (iframeDoc: Document) => {
        const table = devMode
          ? await waitForElement(
              "div[role='table']:nth-child(1)",
              TIMEOUT,
              iframeDoc
            )
          : (await waitForElement("a#\\31 ", TIMEOUT, iframeDoc)).parentNode;
        hideToRoot(table!.parentElement?.parentElement as Element);
        const problemContainer = devMode
          ? await waitForElement(
              "div[role='rowgroup']",
              TIMEOUT,
              table as unknown as Document
            )
          : table;

        const addButton = async () => {
          const rowList =
            problemContainer?.querySelectorAll(
              devMode ? "div[role='row']" : "a"
            ) ?? [];
          for (const question of rowList) {
            try {
              const anchor = (
                devMode
                  ? await waitForElement(
                      "div[role='cell'] a",
                      TIMEOUT,
                      question as unknown as Document
                    )
                  : question
              ) as HTMLAnchorElement;
              const link = anchor.href;

              const questionId = getQuestionIdFromUrl(link);
              if (filterQuestionIds?.includes(questionId)) {
                try {
                  problemContainer!.removeChild(question);
                  return;
                } catch (error) {
                  console.log("cannot remove", error);
                }
              }
              let target = question; // default to the question itself in devmode will be modifed if not in devmode
              if (!devMode) {
                const divWrapper = document.createElement("div");
                divWrapper.className = anchor.className;
                divWrapper.innerHTML = anchor.innerHTML;
                divWrapper.style.cssText = anchor.style.cssText;
                [...anchor.attributes].forEach((attr) => {
                  if (attr.name.startsWith("data-")) {
                    divWrapper.setAttribute(attr.name, attr.value);
                  }
                });
                anchor.parentNode!.replaceChild(divWrapper, anchor);
                target = divWrapper.childNodes[0] as HTMLElement;
              }

              const buttonId = generateId(`question-selector`);
              const oldBtn = target.querySelector(
                `span[${INJECTED_ATTRIBUTE}=${buttonId}]`
              );

              if (oldBtn && devMode) {
                oldBtn.remove();
              } else {
                const injected = document.createElement("span");
                injected.setAttribute(INJECTED_ATTRIBUTE, buttonId);
                target.appendChild(injected);

                createRoot(injected).render(
                  <SelectQuestionButton
                    id={link}
                    onClick={() => {
                      // Handle the question select
                      handleQuestionSelect(link);
                      console.log("Selected question:", link);
                      // Prevent further action
                      return;
                    }}
                  />
                );
              }
            } catch (e) {
              console.error("Unable to locate question link", e);
              // If no link exist, there's no point in displaying the question
              problemContainer!.removeChild(question);
            }
          }
        };
        disablePointerEvents(iframeDoc);
        if (devMode) {
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
        } else {
          // disableNavigateEvents(iframeDoc);
          addButton(); //don't know why in the new UI, the observer is not triggered in the first load so I have to call it manually. The observer still trigger on scrolling tho
        }
        const observer = new MutationObserver(addButton);
        registerObserver("leetcode-table", observer, (obs) => obs.disconnect());
        observer.observe(problemContainer!, { childList: true });
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleQuestionSelect, filterQuestionIds]);

    return (
      <SkeletonWrapper
        loading={loading}
        className="w-full h-full"
        {...container}
      >
        <iframe
          src="https://leetcode.com/problemset/"
          title="LeetCode Question"
          id="leetcode_question"
          className="h-full w-full border-2 border-[#78788033]"
          sandbox="allow-scripts allow-same-origin"
        />
      </SkeletonWrapper>
    );
  }
);
