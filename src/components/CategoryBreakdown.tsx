import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import type { Expense } from '@/types/app';
import { CATEGORY_COLORS } from '@/utils/categories';

interface CategoryBreakdownProps {
  expenses: Expense[];
}


export const CategoryBreakdown = ({ expenses }: CategoryBreakdownProps) => {
  const expenseOnly = expenses.filter(e => e.type === 'expense');
  
  if (expenseOnly.length === 0) {
    return null;
  }

  const categoryTotals = expenseOnly.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Show top 6 categories

  return (
    <Card className="glass-card expense-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedCategories.map(([category, amount]) => {
          const percentage = Math.round((amount / totalExpenses) * 100);
          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other }}
                  />
                  <span className="text-sm font-medium">{category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">${amount.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground ml-2">{percentage}%</span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  '--progress-color': CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
                } as React.CSSProperties}
              />
            </div>
          );
        })}
        
        {Object.keys(categoryTotals).length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Showing top 6 categories
          </p>
        )}
      </CardContent>
    </Card>
  );
};