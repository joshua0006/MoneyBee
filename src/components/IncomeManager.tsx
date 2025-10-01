import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, Pencil, Trash2, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { Expense } from '@/types/app';
import { useToast } from '@/hooks/use-toast';

interface IncomeManagerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'business', label: 'Business' },
  { value: 'investment', label: 'Investment' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' }
];

export const IncomeManager = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: IncomeManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newIncome, setNewIncome] = useState({
    amount: '',
    description: '',
    category: 'salary',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const { toast } = useToast();

  // Filter only income transactions
  const incomeTransactions = expenses.filter(e => e.type === 'income');

  // Filter income for selected month
  const monthlyIncome = incomeTransactions.filter(income => {
    const incomeDate = new Date(income.date);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    return incomeDate >= monthStart && incomeDate <= monthEnd;
  });

  const totalMonthlyIncome = monthlyIncome.reduce((sum, income) => sum + income.amount, 0);

  const handleAddIncome = () => {
    if (!newIncome.amount || !newIncome.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const incomeData: Omit<Expense, 'id'> = {
      amount: parseFloat(newIncome.amount),
      description: newIncome.description,
      category: newIncome.category,
      date: new Date(newIncome.date),
      type: 'income'
    };

    if (editingIncome) {
      onUpdateExpense({ ...incomeData, id: editingIncome.id });
      toast({
        title: "Income updated",
        description: "Your income entry has been updated successfully"
      });
    } else {
      onAddExpense(incomeData);
      toast({
        title: "Income added",
        description: `${newIncome.description} has been added successfully`
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setNewIncome({
      amount: '',
      description: '',
      category: 'salary',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setIsDialogOpen(false);
    setEditingIncome(null);
  };

  const handleEdit = (income: Expense) => {
    setEditingIncome(income);
    setNewIncome({
      amount: income.amount.toString(),
      description: income.description,
      category: income.category,
      date: format(new Date(income.date), 'yyyy-MM-dd')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    onDeleteExpense(id);
    toast({
      title: "Income deleted",
      description: "Income entry has been removed"
    });
  };

  return (
    <div className="space-y-4">
      {/* Monthly Total Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign size={20} />
              Monthly Income
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="add-income-title" aria-describedby="add-income-desc">
                <DialogHeader>
                  <DialogTitle id="add-income-title">
                    {editingIncome ? 'Edit Income' : 'Add Monthly Income'}
                  </DialogTitle>
                  <DialogDescription id="add-income-desc">
                    {editingIncome ? 'Update your income entry details' : 'Enter your monthly income details'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Monthly Salary, Freelance Project"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newIncome.category} onValueChange={(value) =>
                      setNewIncome(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newIncome.date}
                      onChange={(e) => setNewIncome(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <Button onClick={handleAddIncome} className="w-full">
                    {editingIncome ? 'Update Income' : 'Add Income'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-income">
                ${totalMonthlyIncome.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(selectedMonth, 'MMMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(prev => {
                  const newDate = new Date(prev);
                  newDate.setMonth(newDate.getMonth() - 1);
                  return newDate;
                })}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(new Date())}
              >
                <Calendar size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(prev => {
                  const newDate = new Date(prev);
                  newDate.setMonth(newDate.getMonth() + 1);
                  return newDate;
                })}
              >
                →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      {monthlyIncome.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No income entries</h3>
            <p className="text-muted-foreground mb-4">
              Add your first income entry for {format(selectedMonth, 'MMMM yyyy')}
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Income
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {monthlyIncome.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((income) => {
            const categoryLabel = INCOME_CATEGORIES.find(c => c.value === income.category)?.label || income.category;

            return (
              <Card key={income.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{income.description}</h4>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(income.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg text-income">
                        ${income.amount.toFixed(2)}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(income)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(income.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
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
