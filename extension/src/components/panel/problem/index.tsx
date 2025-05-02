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
  promisedIdentity,
  waitForElement,
} from "@cb/utils";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { SelectQuestionButton } from "./SelectProblemButton";

// We can afford to wait for a bit longer, since it's unlikely that user will complete question that quickly.
const TIMEOUT = 10_000;

const INJECTED_ATTRIBUTE = "data-injected";

interface IframeHandler {
  table: (document: Document) => Promise<Element>;
  rowContainer: (table: Element) => Promise<Element>;
  rowList: (rowContainer: Element) => NodeListOf<Element>;
  anchor: (row: Element) => Promise<Element>;
  anchorContainer: (row: Element) => Element;
  handleOldButton: (oldButton: Element | null) => void;
}

const handler: IframeHandler = {
  table: async (iframeDoc) =>
    (await waitForElement("a#\\31 ", TIMEOUT, iframeDoc)).parentNode as Element,
  rowContainer: promisedIdentity,
  rowList: (rowContainer) => rowContainer.querySelectorAll("a"),
  anchor: promisedIdentity,
  anchorContainer: (question) => {
    const divWrapper = document.createElement("div");
    divWrapper.className = question.className;
    divWrapper.innerHTML = question.innerHTML;
    divWrapper.style.cssText = (question as HTMLElement).style.cssText;
    [...question.attributes].forEach((attr) =>
      divWrapper.setAttribute(attr.name, attr.value)
    );
    if (question.parentNode) {
      question.parentNode.replaceChild(divWrapper, question);
    }
    return divWrapper.childNodes[0] as HTMLElement;
  },
  handleOldButton: () => {},
};

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
        const table = await handler.table(iframeDoc);
        hideToRoot(table.parentElement?.parentElement);
        const rowContainer = await handler.rowContainer(table);
        rowContainer.classList.add("space-y-1", "mt-4");

        const addButton = async () => {
          const rowList = handler.rowList(rowContainer) ?? [];
          for (const question of rowList) {
            const anchorContainer = handler.anchorContainer(
              question
            ) as HTMLElement;
            // anchorContainer.classList.add("h-12");
            try {
              const anchor = (await handler.anchor(
                question
              )) as HTMLAnchorElement;
              const link = anchor.href;
              const questionId = getQuestionIdFromUrl(link);
              if (filterQuestionIds.includes(questionId)) {
                try {
                  // rowContainer.removeChild(anchorContainer);
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
              handler.handleOldButton(oldBtn);
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
