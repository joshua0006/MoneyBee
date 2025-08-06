import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Trash2, Play, Pause, Clock, TrendingUp, TrendingDown, Eye, Calendar as CalendarIconSmall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  type RecurringTransaction,
  saveRecurringToStorage,
  loadRecurringFromStorage,
  calculateNextDueDate,
  getUpcomingRecurring,
  getFrequencyDisplay,
  getNextOccurrenceText,
  processDueRecurringTransactions
} from "@/utils/recurringUtils";
import type { Account } from '@/types/app';

interface RecurringTransactionManagerProps {
  accounts: Account[];
  onGenerateExpenses: (expenses: any[]) => void;
}

export const RecurringTransactionManager = ({ accounts, onGenerateExpenses }: RecurringTransactionManagerProps) => {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'expense' | 'income',
    accountId: '',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    startDate: new Date(),
    endDate: undefined as Date | undefined,
    dayOfWeek: new Date().getDay(),
    dayOfMonth: new Date().getDate(),
    notes: ''
  });

import { EXPENSE_CATEGORIES } from '@/utils/categories';

  useEffect(() => {
    setRecurringTransactions(loadRecurringFromStorage());
  }, []);

  useEffect(() => {
    saveRecurringToStorage(recurringTransactions);
  }, [recurringTransactions]);

  // Check for due transactions on component mount and periodically
  useEffect(() => {
    const checkDueTransactions = () => {
      const { expenses, updatedRecurring } = processDueRecurringTransactions(recurringTransactions);
      
      if (expenses.length > 0) {
        setRecurringTransactions(updatedRecurring);
        onGenerateExpenses(expenses);
        
        toast({
          title: "🔄 Recurring Transactions Processed",
          description: `Generated ${expenses.length} new transaction${expenses.length > 1 ? 's' : ''}`,
          duration: 5000
        });
      }
    };

    checkDueTransactions();
    const interval = setInterval(checkDueTransactions, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [recurringTransactions, onGenerateExpenses, toast]);

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      type: 'expense',
      accountId: accounts[0]?.id || '',
      frequency: 'monthly',
      startDate: new Date(),
      endDate: undefined,
      dayOfWeek: new Date().getDay(),
      dayOfMonth: new Date().getDate(),
      notes: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.category || !formData.accountId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    const nextDueDate = calculateNextDueDate(
      formData.startDate,
      formData.frequency,
      formData.dayOfWeek,
      formData.dayOfMonth
    );

    const recurringTransaction: RecurringTransaction = {
      id: editingTransaction?.id || Date.now().toString(),
      amount,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      accountId: formData.accountId,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
      dayOfMonth: formData.frequency !== 'weekly' ? formData.dayOfMonth : undefined,
      isActive: true,
      nextDueDate,
      notes: formData.notes,
      createdAt: editingTransaction?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingTransaction) {
      setRecurringTransactions(prev => 
        prev.map(r => r.id === editingTransaction.id ? recurringTransaction : r)
      );
      toast({
        title: "✅ Recurring Transaction Updated",
        description: `${formData.description} updated successfully`
      });
    } else {
      setRecurringTransactions(prev => [...prev, recurringTransaction]);
      toast({
        title: "✅ Recurring Transaction Added",
        description: `${formData.description} will repeat ${getFrequencyDisplay(formData.frequency).toLowerCase()}`
      });
    }

    setIsAddDialogOpen(false);
    setEditingTransaction(null);
    resetForm();
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      accountId: transaction.accountId,
      frequency: transaction.frequency,
      startDate: transaction.startDate,
      endDate: transaction.endDate,
      dayOfWeek: transaction.dayOfWeek || new Date().getDay(),
      dayOfMonth: transaction.dayOfMonth || new Date().getDate(),
      notes: transaction.notes || ''
    });
    setEditingTransaction(transaction);
    setIsAddDialogOpen(true);
  };

  const handleToggleActive = (id: string) => {
    setRecurringTransactions(prev =>
      prev.map(r => r.id === id ? { ...r, isActive: !r.isActive, updatedAt: new Date() } : r)
    );
  };

  const handleDelete = (id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    toast({
      title: "🗑️ Recurring Transaction Deleted",
      description: "The recurring transaction has been removed"
    });
  };

  const activeTransactions = recurringTransactions.filter(r => r.isActive);
  const inactiveTransactions = recurringTransactions.filter(r => !r.isActive);
  const upcomingTransactions = getUpcomingRecurring(activeTransactions, 30);

  // Check if accounts exist
  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Accounts Found</h2>
          <p className="text-muted-foreground mb-6">
            You need to create at least one account before setting up recurring transactions.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recurring Transactions</h2>
          <p className="text-muted-foreground">Automate your regular income and expenses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTransaction(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction 
                  ? 'Update your recurring transaction details' 
                  : 'Set up a transaction that repeats automatically'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Amount and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'expense' | 'income' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-expense" />
                          Expense
                        </div>
                      </SelectItem>
                      <SelectItem value="income">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-income" />
                          Income
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="e.g., Netflix Subscription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Category and Account */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="account">Account *</Label>
                  <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as RecurringTransaction['frequency'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date (Optional) */}
              <div>
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                    <div className="p-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFormData({ ...formData, endDate: undefined })}
                        className="w-full"
                      >
                        Clear End Date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingTransaction ? 'Update' : 'Add'} Recurring Transaction
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-income" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-income">
                  ${activeTransactions
                    .filter(r => r.type === 'income' && r.frequency === 'monthly')
                    .reduce((sum, r) => sum + r.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-expense" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold text-expense">
                  ${activeTransactions
                    .filter(r => r.type === 'expense' && r.frequency === 'monthly')
                    .reduce((sum, r) => sum + r.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Transactions Toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant={showUpcoming ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUpcoming(!showUpcoming)}
          className="flex items-center gap-2"
        >
          <CalendarIconSmall className="h-4 w-4" />
          {showUpcoming ? 'Hide Upcoming' : 'Show Upcoming'} ({upcomingTransactions.length})
        </Button>
      </div>

      {/* Upcoming Transactions */}
      {showUpcoming && upcomingTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIconSmall className="h-5 w-5" />
              Upcoming Transactions (Next 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTransactions.slice(0, 10).map(({ recurring, dueDate }, index) => (
                <div key={`${recurring.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      recurring.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                    }`}>
                      {recurring.type === 'income' ? 
                        <TrendingUp className="h-4 w-4 text-income" /> : 
                        <TrendingDown className="h-4 w-4 text-expense" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{recurring.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(dueDate, "MMM d, yyyy")} • {getFrequencyDisplay(recurring.frequency)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      recurring.type === 'income' ? 'text-income' : 'text-expense'
                    }`}>
                      ${recurring.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{recurring.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Recurring Transactions */}
      {activeTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                    }`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className="h-5 w-5 text-income" /> : 
                        <TrendingDown className="h-5 w-5 text-expense" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{getFrequencyDisplay(transaction.frequency)}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{getNextOccurrenceText(transaction)}</span>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      }`}>
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(transaction.id)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{transaction.description}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Recurring Transactions */}
      {inactiveTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Inactive Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Pause className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {getFrequencyDisplay(transaction.frequency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">${transaction.amount.toFixed(2)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(transaction.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{transaction.description}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {recurringTransactions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recurring Transactions</h3>
            <p className="text-muted-foreground mb-6">
              Set up recurring transactions to automate your regular income and expenses.
            </p>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};