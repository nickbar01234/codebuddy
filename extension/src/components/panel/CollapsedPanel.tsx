const CollapsedPanel = () => {
  return (
    <div className="relative w-full box-border rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full flex items-start justify-center">
      <span className="absolute top-8 rotate-90 inline-block medium whitespace-nowrap font-medium">
        {/* TODO(haianhng31) - Make the inner text fit inside the box instead of hardcode 'top-8' */}
        Code Buddy
      </span>
    </div>
  );
};

export default CollapsedPanel;
