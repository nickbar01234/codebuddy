import { PasteCodeIcon } from "@cb/components/icons";
import { usePeerSelection } from "@cb/hooks/index";
import { capitalize } from "@cb/utils/string";

const EditorToolBar = () => {
  const { activeUserInformation, pasteCode } = usePeerSelection();

  return (
    <div className="flex h-8 items-center justify-between border-b p-2 border-border-quaternary dark:border-border-quaternary overflow-x-scroll hide-scrollbar gap-4">
      <div className="text-text-secondary dark:text-text-secondary text-sm font-normal group">
        {capitalize(activeUserInformation?.code?.code.language ?? "")}
      </div>
      <button
        title="Paste code"
        type="button"
        data-tooltip-target="tooltip-default"
        onClick={pasteCode}
        className="text-black dark:text-white justify-between hover:bg-fill-quaternary dark:hover:bg-fill-quaternary focus:ring-4 focus:outline-none font-medium rounded-lg text-xs text-center inline-flex items-center mt-1 me-1"
      >
        <PasteCodeIcon />
      </button>
    </div>
  );
};

export default EditorToolBar;
