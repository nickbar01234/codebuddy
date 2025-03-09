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
                        const questions =
                            iframe.contentWindow?.document.querySelectorAll(
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
