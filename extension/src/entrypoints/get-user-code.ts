import { getLeetCodeEditor } from "@cb/utils/monaco";

export default defineUnlistedScript(() => {
  const model = getLeetCodeEditor()?.getModel();
  return {
    value: model?.getValue() ?? "",
    language: model?.getLanguageId() ?? "",
  };
});
