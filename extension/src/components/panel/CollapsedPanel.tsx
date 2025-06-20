import Header from "@cb/components/ui/Header";

export const CollapsedPanel = () => {
  return (
    <div className="relative flex items-start justify-center w-full bg-primary">
      <Header className="rotate-90 origin-left absolute left-1/2" />
    </div>
  );
};
