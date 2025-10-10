import { DOM } from "@cb/constants";
import { useCodeBuddyMonacoHtmlActions } from "@cb/hooks/store";

export const CodeBuddyMonacoPortal = () => {
  const { setHtmlElement } = useCodeBuddyMonacoHtmlActions();
  return (
    <div
      id={DOM.CODEBUDDY_EDITOR_ID}
      ref={(node) => setHtmlElement(node)}
      className="hidden"
    />
  );
};
