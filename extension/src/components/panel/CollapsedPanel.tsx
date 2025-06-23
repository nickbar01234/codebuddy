import Header from "@cb/components/ui/Header";

export const CollapsedPanel = () => {
  return (
    <div className="bg-secondary relative flex items-start justify-center h-full w-full rounded-lg">
      <Header className="rotate-90 origin-left absolute left-1/2" />
    </div>
  );
};
