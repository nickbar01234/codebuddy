import { PasteCodeIcon } from "@cb/components/icons";
import { usePeerSelection } from "@cb/hooks/index";
import { capitalize } from "@cb/utils/string";

export const EditorToolBar = () => {
  const { activeUserInformation, pasteCode } = usePeerSelection();

  return (
    <div className="border-border-quaternary dark:border-border-quaternary hide-scrollbar flex h-8 items-center justify-between gap-4 overflow-x-scroll border-b p-2">
      <div className="text-text-secondary dark:text-text-secondary group text-sm font-normal">
        {capitalize(activeUserInformation?.code?.code.language ?? "")}
      </div>
      <button
        title="Paste code"
        type="button"
        data-tooltip-target="tooltip-default"
        onClick={pasteCode}
        className="hover:bg-fill-quaternary dark:hover:bg-fill-quaternary me-1 mt-1 inline-flex items-center justify-between rounded-lg text-center text-xs font-medium text-black focus:outline-none focus:ring-4 dark:text-white"
      >
        <PasteCodeIcon />
      </button>
    </div>
  );
};
