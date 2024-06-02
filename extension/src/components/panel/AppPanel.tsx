import { ResizableBox } from "react-resizable";

const AppPanel = () => {
  return (
    // TODO(nickbar01234) - Save user preference in local storage
    <ResizableBox width={200} axis="x" resizeHandles={["w"]} className="h-full">
      <div className="ml-2 box-border rounded-lg bg-layer-1 dark:bg-dark-layer-1 p-2 h-full">
        Code Buddyasdfasdfasfdasdf
        <div
          className="view-lines monaco-mouse-cursor-text"
          role="presentation"
          aria-hidden="true"
          data-mprt="7"
          style={{
            position: "absolute",
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            fontWeight: "normal",
            fontSize: "13px",
            fontFeatureSettings: "'liga' 0, 'calt' 0",
            lineHeight: "20px",
            letterSpacing: "0px",
            width: "430px",
            height: "448px",
          }}
        >
          <div style={{ top: "8px", height: "20px" }} className="view-line">
            <span>
              <span className="mtk4">class</span>
              <span className="mtk1">&nbsp;</span>
              <span className="mtk10">Solution</span>
              <span className="mtk1">:</span>
            </span>
          </div>
          <div style={{ top: "28px", height: "20px" }} className="view-line">
            <span>
              <span className="mtk1">&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="mtk4">def</span>
              <span className="mtk1">&nbsp;</span>
              <span className="mtk11">twoSum</span>
              <span className="mtk1">(</span>
              <span className="mtk14">self</span>
              <span className="mtk1">,&nbsp;</span>
              <span className="mtk14">nums</span>
              <span className="mtk1">:&nbsp;List[</span>
              <span className="mtk10">int</span>
              <span className="mtk1">],&nbsp;</span>
              <span className="mtk14">target</span>
              <span className="mtk1">:&nbsp;</span>
              <span className="mtk10">int</span>
              <span className="mtk1">)&nbsp;</span>
            </span>
          </div>
          <div style={{ top: "48px", height: "20px" }} className="view-line">
            <span>
              <span className="mtk1">-&gt;&nbsp;List[</span>
              <span className="mtk10">int</span>
              <span className="mtk1">]:</span>
            </span>
          </div>
          <div style={{ top: "68px", height: "20px" }} className="view-line">
            <span>
              <span className="mtk1">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
          </div>
        </div>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
