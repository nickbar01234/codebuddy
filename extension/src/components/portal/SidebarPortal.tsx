import { DOM } from "@cb/constants";

export const SidebarPortal = () => (
  <div
    id={DOM.CODEBUDDY_SIDEBAR_ID}
    className="fixed top-0 left-0 w-full h-full overflow-hidden z-[1000] pointer-events-none"
  />
);
