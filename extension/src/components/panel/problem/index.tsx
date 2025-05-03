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

    useEffect(() => {
      const handleIframeStyle = async (iframeDoc: Document) => {
        const table = (await waitForElement("a#\\31 ", TIMEOUT, iframeDoc))
          .parentNode as Element;
        hideToRoot(table.parentElement?.parentElement);
        const rowContainer = table;
        rowContainer.classList.add("space-y-1", "mt-4");

        const addButton = async () => {
          const rowList = rowContainer.querySelectorAll("a");
          for (const question of rowList) {
            const questionElement = question as HTMLElement;
            const divWrapper = document.createElement("div");
            divWrapper.className = questionElement.className;
            divWrapper.innerHTML = questionElement.innerHTML;
            divWrapper.style.cssText = questionElement.style.cssText;
            [...questionElement.attributes].forEach((attr) =>
              divWrapper.setAttribute(attr.name, attr.value)
            );
            if (questionElement.parentNode) {
              questionElement.parentNode.replaceChild(
                divWrapper,
                questionElement
              );
            }
            const anchorContainer = divWrapper.childNodes[0] as HTMLElement;

            // anchorContainer.classList.add("h-12");
            try {
              const link = (question as HTMLAnchorElement).href;
              const questionId = getQuestionIdFromUrl(link);
              if (filterQuestionIds.includes(questionId)) {
                try {
                  anchorContainer.remove();
                  return;
                } catch (error) {
                  console.log("cannot remove", error);
                }
              }
              const buttonId = generateId(`question-selector`);
              const oldBtn = anchorContainer.querySelector(
                `span[${INJECTED_ATTRIBUTE}=${buttonId}]`
              );
              if (!oldBtn) {
                const injected = document.createElement("span");
                injected.setAttribute(INJECTED_ATTRIBUTE, buttonId);
                anchorContainer.appendChild(injected);

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
              rowContainer.removeChild(anchorContainer);
            }
          }
        };
        const observer = new MutationObserver(addButton);
        registerObserver("leetcode-table", observer, (obs) => obs.disconnect());
        observer.observe(rowContainer, { childList: true });
        disablePointerEvents(iframeDoc);

        addButton(); //don't know why in the new UI, the observer is not triggered in the first load so I have to call it manually. The observer still trigger on scrolling tho
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
    }, [handleQuestionSelect, filterQuestionIds, registerObserver]);

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
