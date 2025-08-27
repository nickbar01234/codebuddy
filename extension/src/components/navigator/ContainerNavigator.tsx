import Header from "@cb/components/ui/Header";

interface ContainerNavigatorProps {
  children?: React.ReactNode;
  menu?: React.ReactNode;
}

export const ContainerNavigator = ({
  children,
  menu,
}: ContainerNavigatorProps) => {
  return (
    <div className="bg-secondary flex h-full w-full flex-col rounded-lg">
      <div className="hide-scrollbar flex h-9 w-full items-center justify-between gap-2 overflow-y-hidden overflow-x-scroll rounded-t-lg bg-[--color-tabset-tabbar-background] p-2">
        <Header />
        {menu}
      </div>
      <div className="overflow-y-hidden h-full w-full rounded-b-lg">
        {children}
      </div>
    </div>
  );
};
