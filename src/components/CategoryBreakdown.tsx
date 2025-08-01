import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

interface CategoryBreakdownProps {
  expenses: Expense[];
}

const categoryColors: Record<string, string> = {
  "Food & Dining": "hsl(25 95% 53%)",
  "Transportation": "hsl(217 91% 60%)", 
  "Shopping": "hsl(271 91% 65%)",
  "Entertainment": "hsl(336 84% 61%)",
  "Bills & Utilities": "hsl(0 73% 69%)",
  "Healthcare": "hsl(142 71% 45%)",
  "Travel": "hsl(187 85% 53%)",
  "Education": "hsl(231 48% 48%)",
  "Personal Care": "hsl(45 93% 47%)",
  "Other": "hsl(220 9% 46%)"
};

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
    <Card className="shadow-soft border-0">
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
                    style={{ backgroundColor: categoryColors[category] || categoryColors.Other }}
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
                  '--progress-color': categoryColors[category] || categoryColors.Other
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