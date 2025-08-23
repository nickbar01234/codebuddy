import { defineUnlistedScript } from "#imports";
import { DOM } from "@cb/constants";
import { getOrCreateWindowMesseger } from "@cb/services/messenger";
import { getCodeBuddyEditor, getLeetCodeEditor } from "@cb/utils/monaco";
import _ from "lodash";

export default defineUnlistedScript(async () => {
  const { sendMessage, onMessage } = getOrCreateWindowMesseger();

  poll({
    fn: () => {
      const editorDom = document.getElementById(DOM.CODEBUDDY_EDITOR_ID);
      if (window.monaco == undefined || editorDom == undefined) {
        return Promise.resolve(false);
      }
      try {
        const editor = getCodeBuddyEditor();
        if (editor == undefined) {
          window.monaco.editor.create(editorDom, {
            readOnly: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            padding: {
              top: 8,
            },
          });
        }
        return Promise.resolve(true);
      } catch {
        return Promise.resolve(false);
      }
    },
    until: _.identity,
  });

  poll({
    fn: () => {
      const model = getLeetCodeEditor()?.getModel();
      if (model == undefined) {
        return Promise.resolve(false);
      }
      model.onDidChangeContent((event) =>
        sendMessage("onEditorChange", event.changes[0])
      );
      return Promise.resolve(true);
    },
    until: _.identity,
  });

  onMessage("paste", ({ data }) => {
    const editor = window.monaco?.editor
      .getEditors()
      .filter((e: any) => e.id !== "CodeBuddy")
      .find((m: any) => m.getModel().getLanguageId() !== "plaintext");
    const model = editor?.getModel();
    if (editor != undefined && model != undefined) {
      editor.executeEdits(null, [
        {
          range: model.getFullModelRange(),
          text: data,
        },
      ]);
    }
  });
});
