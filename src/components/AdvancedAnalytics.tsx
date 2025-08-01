import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateMonthlyTrends, getTopSpendingCategories, type Expense } from "@/utils/expenseUtils";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface AdvancedAnalyticsProps {
  expenses: Expense[];
}

export const AdvancedAnalytics = ({ expenses }: AdvancedAnalyticsProps) => {
  const monthlyTrends = calculateMonthlyTrends(expenses);
  const topCategories = getTopSpendingCategories(expenses, 3);
  
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    e.date.toISOString().substring(0, 7) === currentMonth
  ).reduce((sum, e) => sum + e.amount, 0);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = lastMonth.toISOString().substring(0, 7);
  const lastMonthExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    e.date.toISOString().substring(0, 7) === lastMonthKey
  ).reduce((sum, e) => sum + e.amount, 0);

  const expenseChange = lastMonthExpenses > 0 
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;

  const avgDailySpending = currentMonthExpenses / new Date().getDate();
  const projectedMonthly = avgDailySpending * 30;

  if (expenses.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Change</p>
                <p className={`text-lg font-bold ${expenseChange >= 0 ? 'text-expense' : 'text-success'}`}>
                  {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                </p>
              </div>
              <div className={`p-2 rounded-full ${expenseChange >= 0 ? 'bg-expense/10' : 'bg-success/10'}`}>
                {expenseChange >= 0 ? (
                  <TrendingUp size={16} className="text-expense" />
                ) : (
                  <TrendingDown size={16} className="text-success" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Daily Average</p>
                <p className="text-lg font-bold text-foreground">
                  ${avgDailySpending.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign size={16} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Projection */}
      <Card className="shadow-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={16} />
            Monthly Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current spending</span>
              <span className="font-medium">${currentMonthExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projected total</span>
              <span className={`font-medium ${projectedMonthly > currentMonthExpenses * 1.2 ? 'text-expense' : 'text-foreground'}`}>
                ${projectedMonthly.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div 
                className="h-2 bg-gradient-to-r from-income to-expense rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((currentMonthExpenses / projectedMonthly) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Spending Categories */}
      {topCategories.length > 0 && (
        <Card className="shadow-soft border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-expense' : 
                    index === 1 ? 'bg-orange-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <span className="text-sm font-semibold">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends */}
      {monthlyTrends.length > 1 && (
        <Card className="shadow-soft border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyTrends.slice(-3).map((trend, index) => (
                <div key={trend.month} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{trend.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-income">${trend.income.toFixed(0)}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-expense">${trend.expenses.toFixed(0)}</span>
                    <span className={`font-medium ${trend.net >= 0 ? 'text-success' : 'text-expense'}`}>
                      {trend.net >= 0 ? '+' : ''}${trend.net.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};