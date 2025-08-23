import { DOM } from "@cb/constants";
import monaco from "monaco-editor";

const getEditor = (filter: (editor: monaco.editor.ICodeEditor) => boolean) => {
  return window.monaco?.editor.getEditors().find(filter);
};

export const getCodeBuddyEditor = () =>
  getEditor((editor) => editor.getDomNode()?.id === DOM.CODEBUDDY_EDITOR_ID);

export const getLeetCodeEditor = () =>
  getEditor((editor) => {
    const model = editor.getModel();
    return (
      editor.getDomNode()?.id !== DOM.CODEBUDDY_EDITOR_ID &&
      model?.getLanguageId() !== "plaintext"
    );
  });
