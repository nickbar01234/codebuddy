import React from "react";
import { useOnMount, useRTC, useTab } from "@cb/hooks/index";
import { sendServiceRequest } from "@cb/services";

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { informations } = useRTC();
  const { tabs, activeTab, unblur, setActive } = useTab({ informations });

  const canViewCode = activeTab?.viewable ?? false;

  useOnMount(() => {
    sendServiceRequest({ action: "createModel", id: EDITOR_NODE_ID });
  });

  return (
    <div
      data-tabs={tabs.length}
      className="flex flex-col h-full justify-between data-[tabs=0]:blur"
    >
      <div className="flex flex-col grow gap-y-2">
        {/* todo(nickbar01234): Language + paste code */}
        <div
          id={EDITOR_NODE_ID}
          data-view-code={canViewCode}
          className="data-[view-code=false]:blur w-full overflow-hidden h-full"
        />
        {!canViewCode && tabs.length != 0 && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg"
            onClick={unblur}
          >
            View
          </button>
        )}
      </div>
      <div
        className={`flex items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm`}
      >
        {tabs.map(({ id, active }) => (
          <React.Fragment key={id}>
            {/* Leetcode className flexlayout__tab_button_* */}
            <div
              className={`relative flexlayout__tab_button flexlayout__tab_button_top hover:z-50 ${
                active
                  ? "flexlayout__tab_button-selected medium"
                  : "flexlayout__tab_button--unselected normal"
              }`}
              onClick={() => setActive(id)}
            >
              {id}
            </div>
            {/* Leetcode className flexlayout__tabset_tab_divider */}
            <div className="flexlayout__tabset_tab_divider" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default EditorPanel;
