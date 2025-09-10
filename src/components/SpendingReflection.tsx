import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Target, TrendingUp, Heart } from "lucide-react";
import type { Expense } from "@/types/app";
import { VALUE_TAGS, getValueTagColor, VALUE_TAG_DESCRIPTIONS, type ValueTag } from "@/utils/valueTagging";

interface SpendingReflectionProps {
  expenses: Expense[];
}

export const SpendingReflection = ({ expenses }: SpendingReflectionProps) => {
  const analysis = useMemo(() => {
    const recentExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return expenseDate >= thirtyDaysAgo && expense.type === 'expense';
    });

    const totalSpent = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const valueSpending: Record<string, { amount: number; count: number }> = {};
    const untaggedAmount = recentExpenses
      .filter(expense => !expense.valueTags?.length)
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate spending by value tag
    recentExpenses.forEach(expense => {
      if (expense.valueTags?.length) {
        expense.valueTags.forEach(tag => {
          if (!valueSpending[tag]) {
            valueSpending[tag] = { amount: 0, count: 0 };
          }
          valueSpending[tag].amount += expense.amount / expense.valueTags.length; // Split amount across tags
          valueSpending[tag].count += 1;
        });
      }
    });

    // Calculate percentages and generate insights
    const valuePercentages = Object.entries(valueSpending).map(([tag, data]) => ({
      tag: tag as ValueTag,
      amount: data.amount,
      percentage: (data.amount / totalSpent) * 100,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    const untaggedPercentage = (untaggedAmount / totalSpent) * 100;

    // Generate reflection prompts
    const reflections: string[] = [];
    
    if (untaggedPercentage > 40) {
      reflections.push(`${untaggedPercentage.toFixed(0)}% of your spending lacks value alignment tags. Consider reflecting on what values these expenses serve.`);
    }

    if (valuePercentages.length > 0) {
      const topValue = valuePercentages[0];
      reflections.push(`Your top value-aligned spending is on ${topValue.tag} (${topValue.percentage.toFixed(0)}% of budget). Does this align with your priorities?`);
    }

    const healthSpending = valuePercentages.find(v => v.tag === 'Health');
    const learningSpending = valuePercentages.find(v => v.tag === 'Learning');
    
    if (!healthSpending || healthSpending.percentage < 5) {
      reflections.push("Consider if you're investing enough in your Health and wellbeing.");
    }

    if (!learningSpending || learningSpending.percentage < 3) {
      reflections.push("Are you allocating resources toward Learning and personal growth?");
    }

    return {
      valuePercentages,
      untaggedAmount,
      untaggedPercentage,
      totalSpent,
      reflections,
      expenseCount: recentExpenses.length
    };
  }, [expenses]);

  if (analysis.expenseCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Values Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add some expenses with value tags to see your spending reflection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Values Reflection
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Last 30 days • ${analysis.totalSpent.toFixed(2)} total spending
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Value-aligned spending breakdown */}
        {analysis.valuePercentages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Value-Aligned Spending
            </h4>
            {analysis.valuePercentages.map(({ tag, amount, percentage }) => (
              <div key={tag} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${getValueTagColor(tag)}/10`, 
                      borderColor: getValueTagColor(tag),
                      color: getValueTagColor(tag)
                    }}
                  >
                    {tag}
                  </Badge>
                  <span className="text-sm">
                    ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{ 
                    backgroundColor: `${getValueTagColor(tag)}/20` 
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {VALUE_TAG_DESCRIPTIONS[tag as keyof typeof VALUE_TAG_DESCRIPTIONS]}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Untagged spending alert */}
        {analysis.untaggedPercentage > 20 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Unaligned Spending</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ${analysis.untaggedAmount.toFixed(2)} ({analysis.untaggedPercentage.toFixed(1)}%) 
              of your spending doesn't have value tags. Consider what values these expenses serve.
            </p>
          </div>
        )}

        {/* Reflection prompts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Reflection Questions
          </h4>
          <div className="space-y-2">
            {analysis.reflections.map((reflection, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{reflection}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};