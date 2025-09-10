import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MonthPickerProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  className?: string;
}

export function MonthPicker({ selectedMonth, onMonthChange, className }: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const goToPreviousMonth = () => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onMonthChange(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = format(selectedMonth, "yyyy-MM") === format(new Date(), "yyyy-MM");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={goToPreviousMonth}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[140px] justify-center text-sm font-medium",
              !isCurrentMonth && "text-primary"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedMonth, "MMMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                goToCurrentMonth();
                setIsOpen(false);
              }}
              disabled={isCurrentMonth}
            >
              Current Month
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              Use arrows to navigate months
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={goToNextMonth}
        disabled={format(selectedMonth, "yyyy-MM") >= format(new Date(), "yyyy-MM")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}