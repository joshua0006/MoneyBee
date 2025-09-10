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
    <div className="space-y-4">
      {/* Main Overview Card */}
      <Card className="glass-card expense-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col items-center gap-3">
            <CardTitle className="text-lg">Monthly Overview</CardTitle>
            <MonthPicker
              selectedMonth={selectedMonth}
              onMonthChange={onMonthChange}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Circular Progress Indicators */}
          <div className="flex justify-around items-center gap-4 sm:gap-6">
            {/* Income Circle */}
            <div className="text-center flex-1">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--income))"
                    strokeWidth="2"
                    strokeDasharray={`${incomePercentage}, 100`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-income">{incomePercentage}%</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Income</p>
              <p className="text-sm sm:text-base font-semibold text-income">{formatCurrency(totalIncome)}</p>
            </div>

            {/* Expenses Circle */}
            <div className="text-center flex-1">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--expense))"
                    strokeWidth="2"
                    strokeDasharray={`${expensePercentage}, 100`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-expense">{expensePercentage}%</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Expenses</p>
              <p className="text-sm sm:text-base font-semibold text-expense">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>

          {/* Net Total */}
          <div className="text-center pt-3 sm:pt-4 border-t">
            <p className="text-sm text-muted-foreground">Net Total</p>
            <p className={`text-xl sm:text-2xl font-bold ${netTotal >= 0 ? 'text-success' : 'text-expense'}`}>
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