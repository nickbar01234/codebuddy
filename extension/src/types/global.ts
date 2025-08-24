import monaco from "monaco-editor";

declare global {
  interface Window {
    // Only defined if running in the context of Leetcode dom. Chrome "components" like content scripts do not have
    // access to this.
    monaco: typeof monaco | undefined;
  }
}
