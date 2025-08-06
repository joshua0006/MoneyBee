import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Receipt, TrendingUp, Target, PieChart } from "lucide-react";

interface EmptyStateProps {
  type: 'expenses' | 'budget' | 'analytics' | 'search' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  type, 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon 
}: EmptyStateProps) => {
  const configs = {
    expenses: {
      icon: <Receipt className="h-12 w-12 text-muted-foreground/50" />,
      title: "No expenses yet",
      description: "Start tracking your spending by adding your first expense",
      actionLabel: "Add Expense",
    },
    budget: {
      icon: <Target className="h-12 w-12 text-muted-foreground/50" />,
      title: "No budgets set",
      description: "Create budgets to track your spending goals and stay on target",
      actionLabel: "Create Budget",
    },
    analytics: {
      icon: <TrendingUp className="h-12 w-12 text-muted-foreground/50" />,
      title: "No data to analyze",
      description: "Add some expenses to see insights and trends about your spending",
      actionLabel: "Add Expense",
    },
    search: {
      icon: <PieChart className="h-12 w-12 text-muted-foreground/50" />,
      title: "No results found",
      description: "Try adjusting your search criteria or add more transactions",
      actionLabel: "Clear Filters",
    },
    general: {
      icon: <Plus className="h-12 w-12 text-muted-foreground/50" />,
      title: "Nothing here yet",
      description: "Get started by adding some data",
      actionLabel: "Get Started",
    }
  };

  const config = configs[type];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 animate-pulse">
          {displayIcon}
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {displayDescription}
        </p>
        {onAction && (
          <Button onClick={onAction} className="bee-button">
            <Plus className="w-4 h-4 mr-2" />
            {displayActionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};