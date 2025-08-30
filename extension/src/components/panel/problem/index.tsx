import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import useResource from "@cb/hooks/useResource";
import { iframeService } from "@cb/services/iframe";
import {
  appendClassIdempotent,
  getQuestionIdFromUrl,
  hideToRoot,
  waitForElement,
} from "@cb/utils";
import React, { useEffect, useRef } from "react";

const INJECTED_ATTRIBUTE = "data-injected";

interface QuestionSelectorPanelProps {
  handleQuestionSelect: (link: string) => void;
  filterQuestionIds: string[];
  container?: Omit<SkelentonWrapperProps, "loading">;
  visible?: boolean;
}

export const QuestionSelectorPanel = React.memo(
  ({
    handleQuestionSelect,
    filterQuestionIds,
    container = {},
    visible = true,
  }: QuestionSelectorPanelProps) => {
    const [loading, setLoading] = React.useState(true);
    const problemSetContainerRef = useRef<HTMLDivElement>(null);
    const { register: registerObserver } = useResource<MutationObserver>({
      name: "observer",
    });

    // Move iframe to this container when visible, back to hidden when not visible
    useEffect(() => {
      if (visible && problemSetContainerRef.current) {
        // If content has already been processed, show immediately
        if (iframeService.isContentProcessed()) {
          setLoading(false);
          // Handle race condition: https://stackoverflow.com/a/779785
          setTimeout(() => {
            iframeService.moveIframeToContainer(
              problemSetContainerRef.current!
            );
          }, 0);
          return;
        }

        // For first time, process content first, then position iframe
        const iframe = iframeService.getIframeElement();
        if (iframe) {
          const processIframe = async () => {
            const handleIframeStyle = async (iframeDoc: Document) => {
              try {
                const rowContainer = (
                  await waitForElement("a#\\31 ", iframeDoc)
                ).parentNode as Element;
                hideToRoot(rowContainer.parentElement?.parentElement);

                const addButton = async () => {
                  const rowList = rowContainer.querySelectorAll("a");
                  appendClassIdempotent(rowContainer, ["space-y-1", "mt-4"]);
                  for (const anchorContainer of rowList) {
                    try {
                      const link = anchorContainer.href;
                      if (link === "") {
                        continue;
                      }
                      const questionId = getQuestionIdFromUrl(link);
                      if (filterQuestionIds.includes(questionId)) {
                        anchorContainer.style.display = "none";
                      }

                      if (!anchorContainer.hasAttribute(INJECTED_ATTRIBUTE)) {
                        const originalHref = anchorContainer.href;
                        anchorContainer.removeAttribute("href");
                        anchorContainer.removeAttribute("onclick");
                        anchorContainer.addEventListener(
                          "click",
                          (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            handleQuestionSelect(originalHref);
                          },
                          true
                        );
                        anchorContainer.style.cursor = "pointer";
                        anchorContainer.setAttribute("role", "button");
                        anchorContainer.setAttribute(INJECTED_ATTRIBUTE, "");
                      }
                    } catch (e) {
                      // TODO(dlinh31): Error is caught for each link at getQuestionIdFromUrl(), need to know why
                      console.error("Unable to locate question link", e);
                    }
                  }
                };

                const observer = new MutationObserver(addButton);
                registerObserver("leetcode-table", observer, (obs) =>
                  obs.disconnect()
                );
                observer.observe(rowContainer, { childList: true });
                addButton();

                const preventNavigation = (e: Event) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "A" && target.hasAttribute("href")) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                };

                iframeDoc.addEventListener("click", preventNavigation, true);
                iframeService.setContentProcessed(true);

                if (problemSetContainerRef.current) {
                  iframeService.moveIframeToContainer(
                    problemSetContainerRef.current
                  );
                }
                setLoading(false);
              } catch (e) {
                console.error("Unable to mount Leetcode iframe", e);
                setLoading(false);
              }
            };

            // TODO(dlinh31): Now, iframe needs a small delay to ensure iframe is attached to DOM, and the modal animation finishes
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Try to process immediately if iframe is loaded, otherwise wait for load event
            const processIframeDocument = async () => {
              const iframeDoc =
                iframe.contentDocument ?? iframe.contentWindow?.document;
              if (iframeDoc) {
                await handleIframeStyle(iframeDoc);
              } else {
                console.error("No iframe document available");
                setLoading(false);
              }
            };

            if (iframeService.isIframeLoaded()) {
              await processIframeDocument();
            } else {
              // Set up load event listener
              const onLoad = async () => {
                iframe.removeEventListener("load", onLoad);
                await processIframeDocument();
              };

              iframe.addEventListener("load", onLoad);

              // Experimental: Also try after a delay in case the load event already fired
              setTimeout(async () => {
                if (
                  iframeService.isIframeLoaded() &&
                  !iframeService.isContentProcessed()
                ) {
                  console.log("Iframe loaded, attempting to process...");
                  iframe.removeEventListener("load", onLoad);
                  await processIframeDocument();
                }
              }, 500);
            }
          };

          processIframe();
        }
      } else if (!visible) {
        iframeService.moveIframeToHiddenContainer();
      }
    }, [visible, handleQuestionSelect, filterQuestionIds, registerObserver]);

    // Handle container resize to reposition iframe
    useEffect(() => {
      if (
        visible &&
        problemSetContainerRef.current &&
        iframeService.isContentProcessed()
      ) {
        const resizeObserver = new ResizeObserver(() => {
          if (problemSetContainerRef.current) {
            iframeService.moveIframeToContainer(problemSetContainerRef.current);
          }
        });

        resizeObserver.observe(problemSetContainerRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }, [visible]);

    return (
      <SkeletonWrapper
        loading={loading}
        className="w-full h-full"
        {...container}
      >
        <div ref={problemSetContainerRef} className="h-full w-full" />
      </SkeletonWrapper>
    );
  }
);
