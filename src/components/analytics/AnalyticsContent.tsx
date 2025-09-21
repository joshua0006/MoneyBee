import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { EmptyState } from "@/components/EmptyState";
import type { Expense } from "@/types/app";

interface AnalyticsContentProps {
  expenses: Expense[];
}

export const AnalyticsContent = ({ expenses }: AnalyticsContentProps) => {
  if (expenses.length === 0) {
    return (
      <div className="p-4 pb-20">
        <EmptyState
          type="analytics"
        />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      <CategoryBreakdown expenses={expenses} />
      <AdvancedAnalytics expenses={expenses} />
    </div>
  );
};