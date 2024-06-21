import React, { useState } from "react";

interface EditorProviderProps {
  children?: React.ReactNode;
  defaultActiveId: string;
}

interface TabMetadata {
  id: string;
  displayHeader: string;
}

interface EditorProviderContext {
  activeId: string;
  registerTab: (tab: TabMetadata) => void;
}

const editorProviderContext = React.createContext({} as EditorProviderContext);
const Provider = editorProviderContext.Provider;

const EditorProvider = (props: EditorProviderProps) => {
  const { children, defaultActiveId } = props;
  const [activeId, setActiveId] = useState(defaultActiveId);
  const [canViewCode, setCanViewCode] = useState(false);
  const [tabs, setTabs] = useState<TabMetadata[]>([]);

  const registerTab = (tab: TabMetadata) => setTabs((prev) => [...prev, tab]);
  const unBlur = () => setCanViewCode(true);

  return (
    <Provider value={{ activeId: activeId, registerTab: registerTab }}>
      <div className="flex flex-col h-full justify-between">
        <div className="relative">
          <div
            id="CodeBuddyEditor"
            data-view-code={canViewCode}
            className="data-[view-code=false]:blur h-[40vh] w-full overflow-x-hidden overflow-y-hidden"
          >
            ...
          </div>
          {!canViewCode && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
  "
              onClick={unBlur}
            >
              View code
            </button>
          )}
          {children}
        </div>
        <div
          className={`flex items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-b-lg p-2 overflow-x-auto text-sm`}
        >
          {tabs.map((tab) => (
            <React.Fragment key={tab.id}>
              {/* Leetcode className flexlayout__tab_button_* */}
              <div
                className={`relative flexlayout__tab_button flexlayout__tab_button_top hover:z-50 ${
                  tab.id === activeId
                    ? "flexlayout__tab_button-selected medium"
                    : "flexlayout__tab_button--unselected normal"
                }`}
                onClick={() => setActiveId(tab.id)}
              >
                {tab.displayHeader}
              </div>
              {/* Leetcode className flexlayout__tabset_tab_divider */}
              <div className="flexlayout__tabset_tab_divider" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </Provider>
  );
};

export default EditorProvider;
export { editorProviderContext, type TabMetadata };
