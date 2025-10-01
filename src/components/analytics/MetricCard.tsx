import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  ariaLabel?: string;
}

export const MetricCard = ({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  valueColor,
  ariaLabel
}: MetricCardProps) => {
  const formattedValue = typeof value === 'number' ? value.toFixed(0) : value;

  return (
    <Card
      className="shadow-soft border-0 hover:shadow-md transition-shadow"
      role="region"
      aria-label={ariaLabel || `${label}: ${formattedValue}`}
    >
      <CardContent className="p-3 md:p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {label}
            </p>
            <p
              className={`text-lg md:text-xl lg:text-2xl font-bold mt-1 ${valueColor || ''}`}
              aria-live="polite"
            >
              {formattedValue}
            </p>
          </div>
          <Icon
            className={`${iconColor} shrink-0 ml-2`}
            size={16}
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
};
