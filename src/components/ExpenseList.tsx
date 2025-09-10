import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Filter } from "lucide-react";
import { SwipeableExpenseItem } from "@/components/SwipeableExpenseItem";
import { EmptyState } from "@/components/EmptyState";
import { getCategoriesForFilter } from "@/utils/categories";
import { useState, useMemo } from "react";

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
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export const ExpenseList = ({ 
  expenses, 
  onExpenseClick, 
  onEditExpense,
  onDeleteExpense,
  showViewAll = false, 
  onViewAll 
}: ExpenseListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  
  // Filter expenses based on selected category
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === "All Categories") {
      return expenses;
    }
    return expenses.filter(expense => expense.category === selectedCategory);
  }, [expenses, selectedCategory]);
  
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
        
        {/* Category Filter */}
        <div className="flex items-center gap-2 mt-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {getCategoriesForFilter().map((category) => (
                <SelectItem key={category} value={category} className="text-sm">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategory !== "All Categories" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("All Categories")}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <SwipeableExpenseItem
              key={expense.id}
              expense={expense}
              onDelete={onDeleteExpense || (() => {})}
              onEdit={onEditExpense}
              onClick={() => onExpenseClick(expense)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No transactions found for "{selectedCategory}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};