import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type InsightType = 'alert' | 'pattern' | 'recommendation' | 'achievement';

interface InsightPanelProps {
  title: string;
  icon: LucideIcon;
  items: string[];
  type?: InsightType;
  ariaLabel?: string;
}

const insightStyles: Record<InsightType, { bg: string; border: string; text: string; iconColor: string }> = {
  alert: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-800 dark:text-orange-200',
    iconColor: 'text-orange-500'
  },
  pattern: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500'
  },
  recommendation: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-500'
  },
  achievement: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-800 dark:text-purple-200',
    iconColor: 'text-purple-500'
  }
};

export const InsightPanel = ({
  title,
  icon: Icon,
  items,
  type = 'pattern',
  ariaLabel
}: InsightPanelProps) => {
  const styles = insightStyles[type];

  if (items.length === 0) return null;

  return (
    <Card
      className="shadow-soft border-0"
      role="region"
      aria-label={ariaLabel || `${title} insights`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Icon
            className={`${styles.iconColor} shrink-0`}
            size={18}
            aria-hidden="true"
          />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-3 md:p-4 rounded-lg border ${styles.bg} ${styles.border}`}
            role="article"
            aria-label={`Insight ${index + 1} of ${items.length}`}
          >
            <p className={`text-sm md:text-base ${styles.text}`}>
              {item}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
