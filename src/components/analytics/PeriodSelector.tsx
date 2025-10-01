import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef } from "react";

interface Period {
  value: string;
  label: string;
}

interface PeriodSelectorProps {
  periods: Period[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel?: string;
}

export const PeriodSelector = ({
  periods,
  value,
  onValueChange,
  ariaLabel = "Select time period"
}: PeriodSelectorProps) => {
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tabsListRef.current?.contains(document.activeElement)) return;

      const currentIndex = periods.findIndex(p => p.value === value);

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % periods.length;
          onValueChange(periods[nextIndex].value);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? periods.length - 1 : currentIndex - 1;
          onValueChange(periods[prevIndex].value);
          break;
        case 'Home':
          e.preventDefault();
          onValueChange(periods[0].value);
          break;
        case 'End':
          e.preventDefault();
          onValueChange(periods[periods.length - 1].value);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [value, periods, onValueChange]);

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className="w-full"
    >
      <TabsList
        ref={tabsListRef}
        className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1"
        role="tablist"
        aria-label={ariaLabel}
      >
        {periods.map((period) => (
          <TabsTrigger
            key={period.value}
            value={period.value}
            className="text-xs sm:text-sm py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            role="tab"
            aria-selected={value === period.value}
            aria-label={`${period.label} period`}
            tabIndex={value === period.value ? 0 : -1}
          >
            {period.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
