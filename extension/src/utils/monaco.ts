import { DOM } from "@cb/constants";
import { editor } from "monaco-editor";

const isCodeBuddyEditor = (e: editor.ICodeEditor) =>
  e.getContainerDomNode().id === DOM.CODEBUDDY_EDITOR_ID;

const getEditor = (filter: (editor: editor.ICodeEditor) => boolean) =>
  window.monaco?.editor.getEditors().find(filter);

export const getCodeBuddyEditor = () => getEditor(isCodeBuddyEditor);

export const getLeetCodeEditor = () =>
  getEditor(
    (e) =>
      !isCodeBuddyEditor(e) && e.getModel()?.getLanguageId() !== "plaintext"
  );
