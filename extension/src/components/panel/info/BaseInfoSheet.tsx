import { Sheet, SheetContent, SheetTrigger } from "@cb/lib/components/ui/sheet";

interface BaseInfoSheetProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const BaseInfoSheet = ({ trigger, children }: BaseInfoSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="bg-secondary z-[2000] [&>button:first-of-type]:hidden">
        {children}
      </SheetContent>
    </Sheet>
  );
};
