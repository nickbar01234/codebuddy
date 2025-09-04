import {
  SkelentonWrapperProps,
  SkeletonWrapper,
} from "@cb/components/ui/SkeletonWrapper";
import useResource from "@cb/hooks/useResource";
import { useHtml } from "@cb/store/htmlStore";
import {
  appendClassIdempotent,
  getQuestionIdFromUrl,
  hideToRoot,
  waitForElement,
} from "@cb/utils";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { toast } from "sonner";

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
    const [contentProcessed, setContentProcessed] = React.useState(false);
    const problemSetContainerRef = useRef<HTMLDivElement>(null);
    const { register: registerObserver } = useResource<MutationObserver>({
      name: "observer",
    });
    const { actions: iframeActions } = useHtml();

    // Move iframe to this container when visible, before DOM paints
    useLayoutEffect(() => {
      if (visible && problemSetContainerRef.current && contentProcessed) {
        iframeActions.showHtmlAtContainer(problemSetContainerRef.current);
      }
    }, [visible, contentProcessed, iframeActions]);

    // Move iframe to this container when visible, back to hidden when not visible
    useEffect(() => {
      if (visible && problemSetContainerRef.current) {
        setContentProcessed(false);
        setLoading(true);

        if (iframeActions.isContentProcessed()) {
          setLoading(false);
          setContentProcessed(true);
        }

        const iframe = iframeActions.getHtmlElement();
        if (iframe) {
          const processIframe = async () => {
            const handleIframeStyle = async (iframeDoc: Document) => {
              waitForElement('button svg[data-icon="sidebar"]', iframeDoc)
                .then((el) => el.closest("button")?.remove())
                .catch(() => {});

              try {
                const rowContainer = (
                  await waitForElement("a#\\31 ", iframeDoc)
                ).parentNode as Element;
                hideToRoot(rowContainer.parentElement?.parentElement);

                const processQuestionLinks = async () => {
                  const rowList = rowContainer.querySelectorAll("a");
                  appendClassIdempotent(rowContainer, ["space-y-1", "mt-4"]);
                  for (const anchorContainer of rowList) {
                    try {
                      const link = anchorContainer.href;
                      if (!link) {
                        continue;
                      }
                      const questionId = getQuestionIdFromUrl(link);
                      if (filterQuestionIds.includes(questionId)) {
                        anchorContainer.style.display = "none";
                      }

                      if (!anchorContainer.hasAttribute(INJECTED_ATTRIBUTE)) {
                        const originalHref = anchorContainer.href;
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
                      console.error("Unable to locate question link", e);
                    }
                  }
                };

                const observer = new MutationObserver(processQuestionLinks);
                registerObserver("leetcode-table", observer, (obs) =>
                  obs.disconnect()
                );
                observer.observe(rowContainer, { childList: true });
                processQuestionLinks();

                iframeActions.setContentProcessed(true);
                setContentProcessed(true);

                if (problemSetContainerRef.current) {
                  iframeActions.showHtmlAtContainer(
                    problemSetContainerRef.current
                  );
                }
                setLoading(false);
              } catch (e) {
                console.error("Unable to mount Leetcode iframe", e);
                toast.error(
                  "Unable to show question selector, please try again later."
                );
                setLoading(false);
              }
            };

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

            if (iframeActions.isHtmlLoaded()) {
              await processIframeDocument();
            } else {
              // Set up load event listener
              const onLoad = async () => {
                iframe.removeEventListener("load", onLoad);
                await processIframeDocument();
              };

              iframe.addEventListener("load", onLoad);
            }
          };

          processIframe();
        }
      } else if (!visible) {
        iframeActions.hideHtml();
        setContentProcessed(false);
      }
    }, [
      visible,
      handleQuestionSelect,
      filterQuestionIds,
      registerObserver,
      iframeActions,
    ]);

    // Handle container resize and window resize to reposition iframe
    useEffect(() => {
      if (visible && problemSetContainerRef.current && contentProcessed) {
        let animationFrameId: number;

        const repositionIframe = () => {
          if (problemSetContainerRef.current) {
            iframeActions.showHtmlAtContainer(problemSetContainerRef.current);
          }
        };

        // repositioning synchronized with browser frames
        const throttledRepositionIframe = () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          animationFrameId = requestAnimationFrame(() => {
            // Add a small delay to ensure dialog recentering completes
            requestAnimationFrame(repositionIframe);
          });
        };

        // Watch for container size changes
        const resizeObserver = new ResizeObserver(throttledRepositionIframe);
        resizeObserver.observe(problemSetContainerRef.current);
        window.addEventListener("resize", throttledRepositionIframe);

        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          resizeObserver.disconnect();
          window.removeEventListener("resize", throttledRepositionIframe);
        };
      }
    }, [visible, contentProcessed, iframeActions]);

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
