import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { SwipeableExpenseItem } from "@/components/SwipeableExpenseItem";
import { EmptyState } from "@/components/EmptyState";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
  date: Date;
  accountId?: string;
  tags?: string[];
  location?: string;
  receiptImage?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseClick: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export const ExpenseList = ({ 
  expenses, 
  onExpenseClick, 
  onDeleteExpense,
  showViewAll = false, 
  onViewAll 
}: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <EmptyState
        type="expenses"
        title="No transactions yet"
        description="Your expense history will appear here"
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          {showViewAll && onViewAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAll}
              className="text-primary hover:text-primary/80"
            >
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {expenses.map((expense) => (
          <SwipeableExpenseItem
            key={expense.id}
            expense={expense}
            onDelete={onDeleteExpense || (() => {})}
            onClick={() => onExpenseClick(expense)}
          />
        ))}
      </CardContent>
    </Card>
  );
};