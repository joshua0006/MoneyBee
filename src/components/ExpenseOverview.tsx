import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocaleCurrency } from "@/hooks/useLocaleCurrency";
import { MonthPicker } from "@/components/MonthPicker";

interface ExpenseOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget?: number;
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

export const ExpenseOverview = ({ 
  totalIncome, 
  totalExpenses, 
  monthlyBudget = 5000,
  selectedMonth,
  onMonthChange 
}: ExpenseOverviewProps) => {
  const { formatCurrency } = useLocaleCurrency();
  const netTotal = totalIncome - totalExpenses;
  const incomePercentage = totalIncome > 0 ? Math.round((totalIncome / (totalIncome + totalExpenses)) * 100) : 0;
  const expensePercentage = totalExpenses > 0 ? Math.round((totalExpenses / (totalIncome + totalExpenses)) * 100) : 0;
  const budgetUsedPercentage = Math.round((totalExpenses / monthlyBudget) * 100);

  return (
    <div className="space-y-3 xs:space-y-4">
      {/* Mobile-First Overview Card */}
      <Card className="glass-card mobile-card-hover border-0 shadow-soft">
        <CardHeader className="pb-2 xs:pb-3 px-3 xs:px-4 pt-3 xs:pt-4">
          <div className="flex flex-col items-center gap-2 xs:gap-3">
            <CardTitle className="text-sm xs:text-base font-semibold text-center">Monthly Overview</CardTitle>
            <div className="w-full max-w-48">
              <MonthPicker
                selectedMonth={selectedMonth}
                onMonthChange={onMonthChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 xs:space-y-4 p-3 xs:p-4">
          {/* Mobile-Optimized Progress Indicators */}
          <div className="flex justify-around items-center gap-2 xs:gap-4">
            {/* Income Circle - Mobile Optimized */}
            <div className="text-center flex-1">
              <div className="relative w-12 h-12 xs:w-16 xs:h-16 mx-auto mb-1.5 xs:mb-2">
                <svg className="w-12 h-12 xs:w-16 xs:h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--income))"
                    strokeWidth="1.5"
                    strokeDasharray={`${incomePercentage}, 100`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] xs:text-xs font-bold text-income">{incomePercentage}%</span>
                </div>
              </div>
              <p className="text-[10px] xs:text-xs text-muted-foreground">Income</p>
              <p className="text-xs xs:text-sm font-semibold text-income">{formatCurrency(totalIncome)}</p>
            </div>

            {/* Expenses Circle - Mobile Optimized */}
            <div className="text-center flex-1">
              <div className="relative w-12 h-12 xs:w-16 xs:h-16 mx-auto mb-1.5 xs:mb-2">
                <svg className="w-12 h-12 xs:w-16 xs:h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--expense))"
                    strokeWidth="1.5"
                    strokeDasharray={`${expensePercentage}, 100`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] xs:text-xs font-bold text-expense">{expensePercentage}%</span>
                </div>
              </div>
              <p className="text-[10px] xs:text-xs text-muted-foreground">Expenses</p>
              <p className="text-xs xs:text-sm font-semibold text-expense">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>

          {/* Mobile-Optimized Net Total */}
          <div className="text-center pt-2 xs:pt-3 border-t border-border/50">
            <p className="text-xs xs:text-sm text-muted-foreground">Net Total</p>
            <p className={`text-lg xs:text-xl font-bold ${netTotal >= 0 ? 'text-success' : 'text-expense'}`}>
              {formatCurrency(netTotal)}
            </p>
          </div>

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Used</span>
              <span className={budgetUsedPercentage > 100 ? 'text-expense' : 'text-foreground'}>
                {budgetUsedPercentage}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  budgetUsedPercentage > 100 ? 'bg-expense' : 'bg-success'
                }`}
                style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(totalExpenses)}</span>
              <span>{formatCurrency(monthlyBudget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};