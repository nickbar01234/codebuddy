import { DOM } from "@cb/constants";
import { ResponseStatus, WindowMessage } from "@cb/types";
import { getCodeBuddyEditor, getLeetCodeEditor } from "@cb/utils/monaco";

export default defineUnlistedScript(() => {
  if (window.monaco == undefined) {
    return {
      status: ResponseStatus.FAIL,
    };
  }

  const hasNotSetupCodeBuddyEditor = getCodeBuddyEditor() == undefined;
  const codeBuddyEditorDom = document.getElementById(DOM.CODEBUDDY_EDITOR_ID);

  if (codeBuddyEditorDom == null) {
    return {
      status: ResponseStatus.FAIL,
    };
  }

  if (hasNotSetupCodeBuddyEditor) {
    const codeBuddyEditor = window.monaco.editor.create(codeBuddyEditorDom, {
      readOnly: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      minimap: { enabled: false },
      padding: {
        top: 8,
      },
    });
    codeBuddyEditor.updateOptions({
      padding: {
        bottom:
          codeBuddyEditor.getOption(
            window.monaco.editor.EditorOption.lineHeight
          ) * 8,
      },
    });
  }

  const leetCodeEditor = getLeetCodeEditor();
  if (leetCodeEditor == undefined) {
    return {
      status: ResponseStatus.FAIL,
    };
  }

  leetCodeEditor.getModel()?.onDidChangeContent((event) => {
    const onChange: WindowMessage = {
      action: "leetCodeOnChange",
      changes: event.changes[0],
    };
    window.postMessage(onChange);
  });

  console.log("Completed setup for LeetCode and CodeBuddy editor");

  return {
    status: ResponseStatus.SUCCESS,
  };
});
