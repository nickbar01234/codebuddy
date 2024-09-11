import React, { useState } from "react";
import { Ripple } from "@cb/components/ui/Ripple";
import { State, stateContext } from "@cb/context/StateProvider";
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
  const { state } = React.useContext(stateContext);
  const [canViewCode, setCanViewCode] = useState(
    localStorage.getItem("ViewCode") === "true"
  );
  const tabs = informations.map((id) => ({ id, displayHeader: id }));

  const unBlur = () => setCanViewCode(true);
  React.useEffect(() => {
    if (tabs.length != 0) {
      setActiveId(tabs[0].id);
    }
  }, [tabs.length]);

  React.useEffect(() => {
    localStorage.setItem("ViewCode", canViewCode.toString());
  }, [canViewCode]);

  return (
    <Provider value={{ activeId: activeId }}>
      {/* <div>Hihi</div> */}
      {tabs.length === 0 &&
        state === State.ROOM &&
        JSON.parse(localStorage.getItem("curRoomId") || "{}").numberOfUsers ==
          0 && (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg md:shadow-xl">
              <div
                className={
                  "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <Ripple />
            </div>
          </div>
        )}
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
              className="data-[view-code=false]:blur absolute top-0 left-0 w-full overflow-hidden h-full "
            />
            {!canViewCode && tabs.length != 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg
  "
                onClick={unBlur}
              >
                View
              </button>
            )}
          </div>
        </div>
        <div
          className={`flex items-center w-full bg-[--color-tabset-tabbar-background] h-12 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm`}
        >
          {tabs.map((tab) => (
            <React.Fragment key={tab.id}>
              {/* Leetcode className flexlayout__tab_button_* */}
              <div
                className={`relative text-2xl flexlayout__tab_button flexlayout__tab_button_top hover:z-50 ${
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
