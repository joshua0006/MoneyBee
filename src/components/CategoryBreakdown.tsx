import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Utensils, 
  ShoppingCart, 
  Car, 
  Film, 
  Home, 
  Zap, 
  Heart, 
  Shirt, 
  GraduationCap, 
  Shield, 
  Briefcase, 
  HandHeart, 
  MoreHorizontal 
} from 'lucide-react';

import type { Expense } from '@/types/app';
import { CATEGORY_COLORS } from '@/utils/categories';

// Category icon mapping
const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Groceries': ShoppingCart,
  'Transportation': Car,
  'Entertainment': Film,
  'Housing': Home,
  'Utilities': Zap,
  'Health': Heart,
  'Clothing': Shirt,
  'Education': GraduationCap,
  'Insurance': Shield,
  'Work': Briefcase,
  'Donations': HandHeart,
  'Other': MoreHorizontal
} as const;

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
    <Card
      className="glass-card expense-card w-full"
      role="region"
      aria-label="Spending by category breakdown"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {sortedCategories.map(([category, amount]) => {
          const percentage = Math.round((amount / totalExpenses) * 100);
          const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Other;

          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                 <div className="flex items-center gap-2 min-w-0 flex-1">
                   <IconComponent
                     size={16}
                     className="shrink-0"
                     style={{ color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other }}
                     aria-hidden="true"
                   />
                   <span className="text-sm md:text-base font-medium truncate">{category}</span>
                 </div>
                <div className="text-right shrink-0">
                  <span
                    className="text-sm md:text-base font-semibold"
                    aria-label={`${category} spending: $${amount.toFixed(2)}`}
                  >
                    ${amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2" aria-label={`${percentage} percent`}>
                    {percentage}%
                  </span>
                </div>
              </div>
              <Progress
                value={percentage}
                className="h-2"
                style={{
                  '--progress-color': CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
                } as React.CSSProperties}
                aria-label={`${category} represents ${percentage}% of total spending`}
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