import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useLocaleCurrency } from '@/hooks/useLocaleCurrency';
import { MobileSwipeGesture } from './MobileSwipeGesture';
import { cn } from '@/lib/utils';
import type { Expense } from '@/types/app';

interface MobileExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onClick: (expense: Expense) => void;
}

export const MobileExpenseCard = ({ 
  expense, 
  onEdit, 
  onDelete, 
  onClick 
}: MobileExpenseCardProps) => {
  const { formatCurrency } = useLocaleCurrency();
  const [showActions, setShowActions] = useState(false);

  const handleSwipeLeft = () => {
    setShowActions(!showActions);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(expense);
    setShowActions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(expense.id);
    setShowActions(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <MobileSwipeGesture 
      onSwipeLeft={handleSwipeLeft}
      className={cn(
        "transition-all duration-200",
        showActions && "transform -translate-x-20"
      )}
    >
      <div className="relative">
        <Card 
          className={cn(
            "mobile-card-hover cursor-pointer border-0 shadow-soft touch-target bg-card/60 backdrop-blur-sm",
            expense.type === 'income' ? 'border-l-2 border-l-income/50' : 'border-l-2 border-l-expense/50'
          )}
          onClick={() => onClick(expense)}
        >
          <CardContent className="p-3 xs:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm xs:text-base truncate">
                    {expense.description}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] xs:text-xs px-1.5 py-0.5 shrink-0",
                      expense.type === 'income' ? 'bg-income/10 text-income border-income/20' : 'bg-expense/10 text-expense border-expense/20'
                    )}
                  >
                    {expense.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(expense.date)}
                  </p>
                  <p className={cn(
                    "font-semibold text-sm xs:text-base",
                    expense.type === 'income' ? 'text-income' : 'text-expense'
                  )}>
                    {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1.5 h-auto touch-target"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
              >
                <MoreHorizontal size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slide-out Actions */}
        {showActions && (
          <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2 z-10">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 touch-target bg-background border-primary/20"
              onClick={handleEdit}
            >
              <Edit size={12} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 touch-target bg-background border-destructive/20 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 size={12} />
            </Button>
          </div>
        )}
      </div>
    </MobileSwipeGesture>
  );
};