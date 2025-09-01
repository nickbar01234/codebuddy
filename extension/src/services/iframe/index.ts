class IframeService {
  private iframeElement: HTMLIFrameElement;
  private hiddenContainer: HTMLElement;
  private contentProcessed: boolean = false;

  constructor(iframe: HTMLIFrameElement, container: HTMLElement) {
    this.iframeElement = iframe;
    this.hiddenContainer = container;
  }

  getIframeElement() {
    return this.iframeElement;
  }

  showIframeAtContainer(container: HTMLElement) {
    const containerRect = container.getBoundingClientRect();

    // static styles
    this.hiddenContainer.className = "block fixed z-[1000] pointer-events-auto";
    this.iframeElement.className = "w-full h-full block";

    // Runtime-calculated positions, doesn't work with Tailwind classes
    this.hiddenContainer.style.top = `${containerRect.top}px`;
    this.hiddenContainer.style.left = `${containerRect.left}px`;
    this.hiddenContainer.style.width = `${containerRect.width}px`;
    this.hiddenContainer.style.height = `${containerRect.height}px`;
  }

  hideIframe() {
    this.hiddenContainer.className =
      "hidden pointer-events-none fixed z-[1000]";
  }

  isIframeInHiddenContainer() {
    return this.hiddenContainer.contains(this.iframeElement);
  }

  isContentProcessed() {
    return this.contentProcessed;
  }

  setContentProcessed(processed: boolean) {
    this.contentProcessed = processed;
  }

  isIframeLoaded() {
    if (!this.iframeElement.contentDocument) return false;
    return this.iframeElement.contentDocument.readyState === "complete";
  }

  isIframeVisible() {
    return !this.hiddenContainer.classList.contains("hidden");
  }
}

export { IframeService };
