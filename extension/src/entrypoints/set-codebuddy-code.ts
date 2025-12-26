import { ExtractMessage, MessagePayload, WindowMessage } from "@cb/types";

const setCodeBuddyCode = (
  args: MessagePayload<ExtractMessage<WindowMessage, "setCodeBuddyCode">>
) => {
  const { code, language, changes, changeUser } = args;
  const editor = getCodeBuddyEditor();
  const model = editor?.getModel();
  if (window.monaco == undefined || editor == undefined || model == undefined) {
    console.log(
      "CodeBuddy editor or monaco is not defined",
      "Editor available?",
      editor != undefined,
      "Model available?",
      model != undefined,
      "Monaco available?",
      window.monaco != undefined
    );
    return;
  }

  if (
    model.getLanguageId() != language ||
    changeUser ||
    Object.keys(changes).length === 0
  ) {
    window.monaco.editor.setModelLanguage(model, language);
    editor.setValue(code);
    return;
  }

  const editOperations = {
    identifier: { major: 1, minor: 1 },
    range: new window.monaco.Range(
      changes.range.startLineNumber,
      changes.range.startColumn,
      changes.range.endLineNumber,
      changes.range.endColumn
    ),
    text: changes.text,
    forceMoveMarkers: false,
  };
  editor.updateOptions({ readOnly: false });
  editor.executeEdits("apply changes", [editOperations]);
  if (editor.getValue() !== code) {
    editor.setValue(code);
  }
  editor.updateOptions({ readOnly: true });
};

export default defineUnlistedScript(() => {
  console.log("Inject code editor handler");
  window.addEventListener("message", (message: MessageEvent<WindowMessage>) => {
    if (message.data.action == undefined) {
      return;
    }
    const action = message.data.action;
    switch (action) {
      case "setCodeBuddyCode": {
        const { action: _, ...args } = message.data;
        setCodeBuddyCode(args);
        break;
      }

      case "leetCodeOnChange":
      case "navigate":
        break;

      default:
        assertUnreachable(action);
    }
  });
});
