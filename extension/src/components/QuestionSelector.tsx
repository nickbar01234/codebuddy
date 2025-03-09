import React from "react";
import { useOnMount } from "@cb/hooks";
import { waitForElement } from "@cb/utils";

export default function QuestionSelector() {
    const [question, setQuestion] = React.useState<string>("");

    useOnMount(() => {
        console.log("mounted");
        waitForElement("#leetcode_question", 2000).then((element) => {
            const iframe = element as HTMLIFrameElement;
            iframe.onload = async () => {
                const iframeDoc =
                    iframe.contentDocument ||
                    (iframe.contentWindow && iframe.contentWindow.document);
                if (iframeDoc) {
                    waitForElement(
                        "div[role='rowgroup']",
                        3000,
                        iframeDoc as Document
                    ).then((element) => {
                        const table = iframeDoc.querySelector(
                            "div[role='table']"
                        ) as HTMLDivElement;
                        // iframeDoc.body.style.display = "none";
                        const allNodes = iframeDoc.body.childNodes;
                        allNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                // If the node is an element

                                console.log(node);
                                // Check if the node is the div with role='table'
                                if (
                                    node instanceof HTMLDivElement &&
                                    node.getAttribute("role") === "table"
                                ) {
                                    console.log("found table");
                                    const grandParent =
                                        node.parentElement?.parentElement;
                                    if (grandParent) {
                                        grandParent.style.display = "block";
                                        grandParent.style.position = "absolute";
                                        grandParent.style.top = "0";
                                        grandParent.style.left = "0";
                                        grandParent.style.width = "100%";
                                    }
                                } else {
                                    (node as HTMLElement).style.display =
                                        "none";
                                }
                            }
                        });

                        const questions = iframeDoc.querySelectorAll(
                            "div[role='row']"
                        ) as NodeListOf<HTMLDivElement>;
                        if (questions != null) {
                            for (let i = 0; i < questions.length; i++) {
                                waitForElement(
                                    "a",
                                    3000,
                                    questions[i] as unknown as Document
                                ).then((element) => {
                                    const link =
                                        questions[i].querySelector("a");
                                    if (link) {
                                        const questionTitle =
                                            link as HTMLAnchorElement;
                                        questions[i].addEventListener(
                                            "click",
                                            (e) => {
                                                console.log(questionTitle.href);
                                            }
                                        );
                                    }
                                });
                            }
                        }
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
            className="z-100 h-full w-full overflow-auto border-none"
            sandbox="allow-scripts allow-same-origin"
        ></iframe>
    );
}
