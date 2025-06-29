import { createRoot } from "react-dom/client";

const Popup = () => {
  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    await browser.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      files: ["content-scripts/content.js"],
    });
  };

  return <button onClick={injectContentScript}>Inject Codebuddy</button>;
};
const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
