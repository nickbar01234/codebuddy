import React from "react";

interface EditorProviderProps {
  children?: React.ReactNode;
  defaultActiveId: string;
}

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

interface EditorProviderContext {
  activeId: string;
  registerTab: (tab: TabMetadata) => void;
}

export const editorProviderContext = React.createContext(
  {} as EditorProviderContext
);
const Provider = editorProviderContext.Provider;

export const EditorProvider = (props: EditorProviderProps) => {
  const { children, defaultActiveId } = props;
  const [activeId, setActiveId] = React.useState(defaultActiveId);
  const [tabs, setTabs] = React.useState<TabMetadata[]>([]);

  const registerTab = (tab: TabMetadata) => setTabs((prev) => [...prev, tab]);

  return (
    <Provider value={{ activeId: activeId, registerTab: registerTab }}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div
            id="CodeBuddyEditor"
            className="h-[40vh] w-full overflow-x-hidden overflow-y-hidden"
          />
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
