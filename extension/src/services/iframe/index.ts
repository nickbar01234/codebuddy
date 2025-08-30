import { DOM } from "@cb/constants";

class IframeService {
  private iframeElement: HTMLIFrameElement | null = null;
  private hiddenContainer: HTMLElement | null = null;
  private contentProcessed: boolean = false;

  setIframeElement(iframe: HTMLIFrameElement) {
    this.iframeElement = iframe;
    this.hiddenContainer = document.getElementById(
      DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME_CONTAINER
    );
  }

  getIframeElement(): HTMLIFrameElement | null {
    return this.iframeElement;
  }

  moveIframeToContainer(container: HTMLElement) {
    if (this.iframeElement && container && this.hiddenContainer) {
      const containerRect = container.getBoundingClientRect();

      // Position the hidden container to overlap the target container
      this.hiddenContainer.style.position = "fixed";
      this.hiddenContainer.style.top = `${containerRect.top}px`;
      this.hiddenContainer.style.left = `${containerRect.left}px`;
      this.hiddenContainer.style.width = `${containerRect.width}px`;
      this.hiddenContainer.style.height = `${containerRect.height}px`;
      this.hiddenContainer.style.opacity = "1";
      this.hiddenContainer.style.pointerEvents = "auto";
      this.hiddenContainer.style.zIndex = "1000";
      this.iframeElement.style.width = "100%";
      this.iframeElement.style.height = "100%";
    }
  }

  moveIframeToHiddenContainer() {
    if (this.hiddenContainer) {
      // Move back to hidden position
      this.hiddenContainer.style.position = "absolute";
      this.hiddenContainer.style.top = "-9999px";
      this.hiddenContainer.style.left = "-9999px";
      this.hiddenContainer.style.width = "1200px";
      this.hiddenContainer.style.height = "800px";
      this.hiddenContainer.style.opacity = "0";
      this.hiddenContainer.style.pointerEvents = "none";
      this.hiddenContainer.style.zIndex = "-1";
    }
  }

  isIframeInHiddenContainer(): boolean {
    if (!this.iframeElement || !this.hiddenContainer) return false;
    return this.hiddenContainer.contains(this.iframeElement);
  }

  isContentProcessed(): boolean {
    return this.contentProcessed;
  }

  setContentProcessed(processed: boolean) {
    this.contentProcessed = processed;
  }

  isIframeLoaded(): boolean {
    if (!this.iframeElement || !this.iframeElement.contentDocument)
      return false;
    return this.iframeElement.contentDocument.readyState === "complete";
  }

  isIframeVisible(): boolean {
    if (!this.hiddenContainer) return false;
    return (
      this.hiddenContainer.style.opacity === "1" &&
      this.hiddenContainer.style.position === "fixed"
    );
  }
}

export const iframeService = new IframeService();
