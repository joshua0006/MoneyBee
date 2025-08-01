import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseOverviewProps {
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget?: number;
}

export const ExpenseOverview = ({ 
  totalIncome, 
  totalExpenses, 
  monthlyBudget = 5000 
}: ExpenseOverviewProps) => {
  const netTotal = totalIncome - totalExpenses;
  const incomePercentage = totalIncome > 0 ? Math.round((totalIncome / (totalIncome + totalExpenses)) * 100) : 0;
  const expensePercentage = totalExpenses > 0 ? Math.round((totalExpenses / (totalIncome + totalExpenses)) * 100) : 0;
  const budgetUsedPercentage = Math.round((totalExpenses / monthlyBudget) * 100);

  return (
    <div className="space-y-4">
      {/* Main Overview Card */}
      <Card className="shadow-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Circular Progress Indicators */}
          <div className="flex justify-around items-center">
            {/* Income Circle */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                  <span className="text-sm font-bold text-income">{incomePercentage}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="font-semibold text-income">${totalIncome.toFixed(2)}</p>
            </div>

            {/* Expenses Circle */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                  <span className="text-sm font-bold text-expense">{expensePercentage}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="font-semibold text-expense">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>

          {/* Net Total */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">Net Total</p>
            <p className={`text-2xl font-bold ${netTotal >= 0 ? 'text-success' : 'text-expense'}`}>
              ${netTotal.toFixed(2)}
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
              <span>${totalExpenses.toFixed(2)}</span>
              <span>${monthlyBudget.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};