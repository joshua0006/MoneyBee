import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { Budget, Expense, calculateBudgetUsage } from '@/utils/expenseUtils';
import { useToast } from '@/hooks/use-toast';

interface BudgetManagerProps {
  budgets: Budget[];
  expenses: Expense[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Travel', 'Education', 'Other'
];

export const BudgetManager = ({ 
  budgets, 
  expenses, 
  onAddBudget, 
  onUpdateBudget, 
  onDeleteBudget 
}: BudgetManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });
  const { toast } = useToast();

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Check if budget for this category already exists
    if (budgets.some(b => b.category === newBudget.category)) {
      toast({
        title: "Budget exists",
        description: "A budget for this category already exists",
        variant: "destructive"
      });
      return;
    }

    onAddBudget({
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    });

    setNewBudget({ category: '', amount: '', period: 'monthly' });
    setIsDialogOpen(false);
    
    toast({
      title: "Budget created",
      description: `Budget for ${newBudget.category} has been set`,
    });
  };

  const getBudgetStatus = (budget: Budget) => {
    const used = calculateBudgetUsage(expenses, budget);
    const percentage = (used / budget.amount) * 100;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'destructive' };
    if (percentage >= 80) return { status: 'warning', color: 'warning' };
    return { status: 'good', color: 'success' };
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + calculateBudgetUsage(expenses, b), 0);
  const overallPercentage = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overall Budget Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target size={20} />
              Budget Overview
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newBudget.category} onValueChange={(value) => 
                      setNewBudget(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter(cat => !budgets.some(b => b.category === cat)).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Budget Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newBudget.amount}
                      onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select value={newBudget.period} onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
                      setNewBudget(prev => ({ ...prev, period: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleAddBudget} className="w-full">
                    Create Budget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="font-bold">${totalBudget.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Used</span>
              <span className={`font-bold ${overallPercentage >= 100 ? 'text-destructive' : 'text-foreground'}`}>
                ${totalUsed.toFixed(2)}
              </span>
            </div>
            <Progress value={Math.min(overallPercentage, 100)} className="h-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {overallPercentage.toFixed(1)}% used
              </span>
              <span className="text-xs text-muted-foreground">
                ${(totalBudget - totalUsed).toFixed(2)} remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Budgets */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Target size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to track your spending goals
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const used = calculateBudgetUsage(expenses, budget);
            const percentage = (used / budget.amount) * 100;
            const remaining = budget.amount - used;
            const status = getBudgetStatus(budget);

            return (
              <Card key={budget.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{budget.category}</h4>
                        {status.status === 'exceeded' && (
                          <AlertTriangle size={16} className="text-destructive" />
                        )}
                        {status.status === 'warning' && (
                          <TrendingUp size={16} className="text-orange-500" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {budget.period}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>${used.toFixed(2)} used</span>
                        <span>${budget.amount.toFixed(2)} budget</span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-2 ${
                          status.status === 'exceeded' ? '[&>div]:bg-destructive' :
                          status.status === 'warning' ? '[&>div]:bg-orange-500' :
                          '[&>div]:bg-green-500'
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span className={remaining < 0 ? 'text-destructive' : ''}>
                          ${Math.abs(remaining).toFixed(2)} {remaining < 0 ? 'over' : 'left'}
                        </span>
                      </div>
                    </div>

                    {percentage >= 80 && (
                      <div className={`text-xs p-2 rounded-md ${
                        status.status === 'exceeded' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-orange-500/10 text-orange-600'
                      }`}>
                        {status.status === 'exceeded' 
                          ? `You've exceeded your budget by $${(used - budget.amount).toFixed(2)}`
                          : `You're approaching your budget limit`
                        }
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};