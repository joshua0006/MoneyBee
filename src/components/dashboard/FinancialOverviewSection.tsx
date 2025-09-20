import { Suspense, lazy } from "react";
import { ExpenseOverview } from "@/components/ExpenseOverview";
import { MicroSavingsChallenge } from "@/components/MicroSavingsChallenge";
import { ProgressiveLoader } from "@/components/ProgressiveLoader";
import { useToast } from "@/hooks/use-toast";

const CategoryBreakdown = lazy(() => import("@/components/CategoryBreakdown").then(m => ({ default: m.CategoryBreakdown })));

interface FinancialOverviewSectionProps {
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  isLoading: boolean;
  monthlyExpenses: any[];
}

export const FinancialOverviewSection = ({
  totalIncome,
  totalExpenses,
  monthlyBudget,
  selectedMonth,
  onMonthChange,
  isLoading,
  monthlyExpenses
}: FinancialOverviewSectionProps) => {
  const { toast } = useToast();

  const handleSavingsTrack = (amount: number) => {
    toast({
      title: "💪 Challenge Completed!",
      description: `You saved $${amount} today. Keep building those habits!`,
      duration: 4000
    });
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      {/* Financial Overview - Mobile Stacked Layout */}
      <div className="space-y-4 xs:space-y-6">
        <ProgressiveLoader isLoading={isLoading} type="overview">
          <div className="bg-gradient-to-br from-card via-background to-card/50 rounded-xl xs:rounded-2xl border border-border/50 shadow-medium p-1">
            <ExpenseOverview 
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              monthlyBudget={monthlyBudget}
              selectedMonth={selectedMonth}
              onMonthChange={onMonthChange}
            />
          </div>
        </ProgressiveLoader>
        
        <ProgressiveLoader isLoading={isLoading} type="card" delay={150}>
          <MicroSavingsChallenge onSavingsTrack={handleSavingsTrack} />
        </ProgressiveLoader>
      </div>
      
      {/* Charts and Analytics - Mobile Stacked */}
      <div className="space-y-4 xs:space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        <ProgressiveLoader isLoading={isLoading} type="chart" delay={100}>
          <div className="bg-card/60 backdrop-blur-sm rounded-xl xs:rounded-2xl border border-border/30 shadow-soft p-1">
            <Suspense fallback={null}>
              <CategoryBreakdown expenses={monthlyExpenses} />
            </Suspense>
          </div>
        </ProgressiveLoader>
      </div>
    </div>
  );
};