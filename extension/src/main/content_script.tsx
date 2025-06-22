import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cb/lib/components/ui/resizable";
import "@cb/style/index.css";
import { waitForElement } from "@cb/utils";
import { createRoot } from "react-dom/client";
import "react-resizable/css/styles.css";

const TIME_OUT = 5000; // ms
const LEETCODE_ROOT_ID = "#qd-content";

waitForElement(LEETCODE_ROOT_ID, TIME_OUT)
  .then((leetCodeNode) => {
    const extensionRoot = document.createElement("div");
    leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
    extensionRoot.classList.add("relative", "h-full", "w-full");

    const leetCodeRoot = document.createElement("div");
    leetCodeRoot.appendChild(leetCodeNode);

    createRoot(extensionRoot).render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <div
            className="relative h-full w-full"
            ref={(ref) => ref?.appendChild(leetCodeNode)}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>hello</ResizablePanel>
      </ResizablePanelGroup>
    );
    // const extensionRoot = document.createElement("div");
    // extensionRoot.id = generateId("root");
    // leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
    // createRoot(extensionRoot).render(
    //   <React.StrictMode>
    //     <Provider store={store}>
    //       <Toaster
    //         richColors
    //         expand
    //         closeButton
    //         visibleToasts={3}
    //         toastOptions={{
    //           duration: 5 * 1000,
    //         }}
    //       />
    //       <AppPanel>
    //         <SessionProvider>
    //           <RootNavigator />
    //         </SessionProvider>
    //       </AppPanel>
    //     </Provider>
    //   </React.StrictMode>
    // );
  })
  .catch(() =>
    console.error(
      `Unable to mount Codebuddy within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
    )
  );
