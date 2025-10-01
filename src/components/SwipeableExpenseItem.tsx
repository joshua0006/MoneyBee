import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2 } from 'lucide-react';
import { useSwipeToDelete } from '@/hooks/useTouchGestures';
import { mobileService } from '@/utils/mobileService';
import { cn } from '@/lib/utils';

interface SwipeableExpenseItemProps {
  expense: {
    id: string;
    amount: number;
    description: string;
    category: string;
    type: 'expense' | 'income';
    date: Date;
  };
  onDelete: (id: string) => void;
  onEdit?: (expense: SwipeableExpenseItemProps['expense']) => void;
  onClick: () => void;
  readOnly?: boolean;
}

export const SwipeableExpenseItem: React.FC<SwipeableExpenseItemProps> = ({
  expense,
  onDelete,
  onEdit,
  onClick,
  readOnly = false
}) => {
  const { ref, isSwipingToDelete, resetSwipe } = useSwipeToDelete(
    readOnly ? undefined : () => {
      mobileService.heavyHaptic();
      onDelete(expense.id);
    }
  );

  const handleClick = () => {
    mobileService.lightHaptic();
    onClick();
  };

  const categoryColors = {
    'Food & Dining': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Transportation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Shopping': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Bills & Utilities': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Healthcare': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Travel': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <TooltipProvider>
      <div className="relative overflow-hidden">
        {/* Delete Action Background */}
        <div
          aria-hidden={!isSwipingToDelete}
          role="presentation"
          className={cn(
            "absolute inset-0 bg-destructive flex items-center justify-end px-4 xs:px-6 transition-opacity duration-200",
            isSwipingToDelete ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-2 text-destructive-foreground">
            <Trash2 className="h-4 w-4 xs:h-5 xs:w-5" />
            <span className="font-medium text-xs xs:text-sm">Delete</span>
          </div>
        </div>

        {/* Main Content */}
        <Card
          ref={ref}
          className={cn(
            "expense-item transition-all duration-200 cursor-pointer touch-manipulation",
            "active:scale-[0.98] hover:shadow-md",
            isSwipingToDelete && "transform translate-x-[-80px]"
          )}
          onClick={handleClick}
          onDoubleClick={resetSwipe}
        >
          <div className="p-3 xs:p-4">
            <div className="flex items-start justify-between gap-2 xs:gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1 mb-1.5 xs:mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h4 className="font-medium text-foreground truncate text-xs xs:text-sm sm:text-base">
                        {expense.description}
                      </h4>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{expense.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 shrink-0 w-fit",
                      categoryColors[expense.category as keyof typeof categoryColors] || categoryColors.Other
                    )}
                  >
                    {expense.category}
                  </Badge>
                </div>
                <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                  {expense.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: expense.date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                  })}
                </p>
              </div>

              <div className={cn(
                "font-semibold text-base xs:text-lg sm:text-xl text-right min-w-[70px] xs:min-w-[80px] sm:min-w-[90px]",
                expense.type === 'income'
                  ? "text-income"
                  : "text-expense"
              )}>
                {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        {/* Swipe Hint */}
        {isSwipingToDelete && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-xs text-muted-foreground animate-pulse" aria-live="polite">
            ← Swipe to delete
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};