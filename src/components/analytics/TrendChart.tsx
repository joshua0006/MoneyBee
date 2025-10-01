import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReactNode } from "react";

interface TrendItem {
  label: string;
  value: number;
  maxValue?: number;
  percentage?: number;
  icon?: ReactNode;
}

interface TrendChartProps {
  title: string;
  items: TrendItem[];
  ariaLabel?: string;
  valueFormatter?: (value: number) => string;
}

export const TrendChart = ({
  title,
  items,
  ariaLabel,
  valueFormatter = (val) => `$${val.toFixed(0)}`
}: TrendChartProps) => {
  const maxValue = Math.max(...items.map(item => item.value));

  return (
    <Card
      className="shadow-soft border-0"
      role="region"
      aria-label={ariaLabel || title}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {items.map((item, index) => {
          const normalizedPercentage = item.percentage ?? (maxValue > 0 ? (item.value / maxValue) * 100 : 0);

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {item.icon && (
                    <span className="shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="text-sm md:text-base font-medium truncate">
                    {item.label}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className="text-sm md:text-base font-semibold"
                    aria-label={`${item.label} value: ${valueFormatter(item.value)}`}
                  >
                    {valueFormatter(item.value)}
                  </span>
                  {item.percentage !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <Progress
                value={normalizedPercentage}
                className="h-2"
                aria-label={`${item.label} progress: ${normalizedPercentage.toFixed(0)}%`}
              />
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No data available
          </p>
        )}
      </CardContent>
    </Card>
  );
};
