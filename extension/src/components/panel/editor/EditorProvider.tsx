import React, { useState } from "react";
interface EditorProviderProps {
  children?: React.ReactNode;
  defaultActiveId: string;
  informations: string[];
}

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

interface EditorProviderContext {
  activeId: string;
  // registerTab: (tab: TabMetadata) => void;
}

export const editorProviderContext = React.createContext(
  {} as EditorProviderContext
);
const Provider = editorProviderContext.Provider;

export const EditorProvider = (props: EditorProviderProps) => {
  const { children, defaultActiveId, informations } = props;
  const [activeId, setActiveId] = useState(defaultActiveId);
  const [canViewCode, setCanViewCode] = useState(false);
  const tabs = informations.map((id) => ({ id, displayHeader: id }));

  const unBlur = () => setCanViewCode(true);
  // React.useEffect(() => {
  //   if (tabs.length != 0) {
  //     setActiveId(tabs[0].id);
  //   }
  // }, [informations]);

  return (
    <Provider value={{ activeId: activeId }}>
      {/* <div>Hihi</div> */}
      <div
        className="flex flex-col h-full justify-between"
        style={{ visibility: tabs.length === 0 ? "hidden" : "visible" }}
      >
        <div className="flex flex-col grow gap-y-2">
          {children}
          <div className="grow relative">
            <div
              id="CodeBuddyEditor"
              data-view-code={canViewCode}
              className="data-[view-code=false]:blur absolute top-0 left-0 w-full overflow-auto h-full "
            />
            {!canViewCode && tabs.length != 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg
  "
                onClick={unBlur}
              >
                View Code
              </button>
            )}
          </div>
        </div>
        <div
          className={`flex items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm`}
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
