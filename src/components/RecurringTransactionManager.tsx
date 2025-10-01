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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Trash2, Play, Pause, Clock, TrendingUp, TrendingDown, Eye, Calendar as CalendarIconSmall, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EXPENSE_CATEGORIES } from '@/utils/categories';
import { 
  type RecurringTransaction,
  calculateNextDueDate,
  getUpcomingRecurring,
  getFrequencyDisplay,
  getNextOccurrenceText,
  processDueRecurringTransactions
} from "@/utils/recurringUtils";
import { 
  loadRecurringTransactionsFromDatabase,
  saveRecurringTransactionToDatabase,
  updateRecurringTransactionInDatabase,
  deleteRecurringTransactionFromDatabase
} from "@/utils/supabaseExpenseUtils";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { scheduleBillReminderCheck } from "@/utils/billReminderService";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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


  // Load recurring transactions from database
  useEffect(() => {
    const loadRecurringTransactions = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const dbTransactions = await loadRecurringTransactionsFromDatabase(user.id);
        // Transform database records to local interface
        const transactions: RecurringTransaction[] = dbTransactions.map(tx => ({
          id: tx.id,
          amount: Number(tx.amount),
          description: tx.description,
          category: tx.category,
          type: tx.type as 'expense' | 'income',
          accountId: tx.account_id,
          frequency: tx.frequency as RecurringTransaction['frequency'],
          startDate: new Date(), // Use next_due_date as startDate for now
          endDate: undefined,
          dayOfWeek: undefined,
          dayOfMonth: undefined,
          isActive: tx.is_active,
          nextDueDate: new Date(tx.next_due_date),
          notes: '',
          createdAt: new Date(tx.created_at),
          updatedAt: new Date(tx.updated_at)
        }));
        setRecurringTransactions(transactions);
        
        // Schedule bill reminder checks
        scheduleBillReminderCheck(transactions);
      } catch (error) {
        console.error('Error loading recurring transactions:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load recurring transactions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecurringTransactions();
  }, [user?.id, toast]);

  // Check for due transactions on component mount and periodically
  useEffect(() => {
    const checkDueTransactions = async () => {
      const { expenses, updatedRecurring } = processDueRecurringTransactions(recurringTransactions);

      if (expenses.length > 0) {
        // Update local state
        setRecurringTransactions(updatedRecurring);

        // Persist next_due_date updates to database
        try {
          const updatePromises = updatedRecurring
            .filter(r => {
              const original = recurringTransactions.find(rt => rt.id === r.id);
              return original && original.nextDueDate.getTime() !== r.nextDueDate.getTime();
            })
            .map(r =>
              updateRecurringTransactionInDatabase(r.id, {
                next_due_date: r.nextDueDate.toISOString().split('T')[0],
                updated_at: new Date().toISOString()
              })
            );

          await Promise.all(updatePromises);
        } catch (error) {
          console.error('Failed to update recurring transaction next due dates:', error);
          toast({
            title: "Sync Warning",
            description: "Expenses generated but recurring schedule may need manual update",
            variant: "destructive",
            duration: 5000
          });
        }

        // Generate expenses
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

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.category || !formData.accountId || !user?.id) {
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

    try {
      if (editingTransaction) {
        // Update existing transaction
        const updateData = {
          amount,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          frequency: formData.frequency,
          account_id: formData.accountId,
          next_due_date: nextDueDate.toISOString().split('T')[0],
          is_active: true
        };
        
        await updateRecurringTransactionInDatabase(editingTransaction.id, updateData);
        
        // Update local state
        const updatedTransaction: RecurringTransaction = {
          ...editingTransaction,
          amount,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          accountId: formData.accountId,
          frequency: formData.frequency,
          nextDueDate,
          updatedAt: new Date()
        };
        
        setRecurringTransactions(prev => 
          prev.map(r => r.id === editingTransaction.id ? updatedTransaction : r)
        );
        
        toast({
          title: "✅ Recurring Transaction Updated",
          description: `${formData.description} updated successfully`
        });
      } else {
        // Create new transaction
        const newTransaction = {
          user_id: user.id,
          amount,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          frequency: formData.frequency,
          account_id: formData.accountId,
          next_due_date: nextDueDate.toISOString().split('T')[0],
          is_active: true
        };
        
        const savedTransaction = await saveRecurringTransactionToDatabase(newTransaction);
        
        if (savedTransaction) {
          // Add to local state
          const localTransaction: RecurringTransaction = {
            id: savedTransaction.id,
            amount: Number(savedTransaction.amount),
            description: savedTransaction.description,
            category: savedTransaction.category,
            type: savedTransaction.type as 'expense' | 'income',
            accountId: savedTransaction.account_id,
            frequency: savedTransaction.frequency as RecurringTransaction['frequency'],
            startDate: formData.startDate,
            endDate: formData.endDate,
            dayOfWeek: formData.dayOfWeek,
            dayOfMonth: formData.dayOfMonth,
            isActive: savedTransaction.is_active,
            nextDueDate: new Date(savedTransaction.next_due_date),
            notes: formData.notes,
            createdAt: new Date(savedTransaction.created_at),
            updatedAt: new Date(savedTransaction.updated_at)
          };
          
          setRecurringTransactions(prev => [...prev, localTransaction]);
          
          toast({
            title: "✅ Recurring Transaction Added",
            description: `${formData.description} will repeat ${getFrequencyDisplay(formData.frequency).toLowerCase()}`
          });
        }
      }

      setIsAddDialogOpen(false);
      setEditingTransaction(null);
      resetForm();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      toast({
        title: "Save Error",
        description: "Failed to save recurring transaction",
        variant: "destructive"
      });
    }
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

  const handleToggleActive = async (id: string) => {
    const transaction = recurringTransactions.find(r => r.id === id);
    if (!transaction) return;

    try {
      const newActiveState = !transaction.isActive;
      await updateRecurringTransactionInDatabase(id, { is_active: newActiveState });
      
      setRecurringTransactions(prev =>
        prev.map(r => r.id === id ? { ...r, isActive: newActiveState, updatedAt: new Date() } : r)
      );
      
      toast({
        title: newActiveState ? "🔄 Recurring Transaction Activated" : "⏸️ Recurring Transaction Paused",
        description: `${transaction.description} ${newActiveState ? 'activated' : 'paused'}`
      });
    } catch (error) {
      console.error('Error toggling transaction:', error);
      toast({
        title: "Update Error",
        description: "Failed to update transaction status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    const transaction = recurringTransactions.find(r => r.id === id);
    if (!transaction) return;

    try {
      await deleteRecurringTransactionFromDatabase(id);
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "🗑️ Recurring Transaction Deleted",
        description: `${transaction.description} has been removed`
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete recurring transaction",
        variant: "destructive"
      });
    }
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

  // Form content component (reused for both Dialog and Sheet)
  const FormContent = () => (
    <ScrollArea className="h-full max-h-[calc(100vh-8rem)] pr-4">
      <div className="space-y-4 pb-4">
        {/* Amount and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="min-h-[44px] text-base"
              aria-required="true"
              aria-invalid={!formData.amount && "true"}
            />
          </div>
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'expense' | 'income' })}>
              <SelectTrigger className="min-h-[44px]" aria-label="Transaction type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-expense" aria-hidden="true" />
                    <span>Expense</span>
                  </div>
                </SelectItem>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-income" aria-hidden="true" />
                    <span>Income</span>
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
            className="min-h-[44px] text-base"
            aria-required="true"
          />
        </div>

        {/* Category and Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="min-h-[44px]" aria-label="Category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="account">Account *</Label>
            <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
              <SelectTrigger className="min-h-[44px]" aria-label="Account">
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
            <SelectTrigger className="min-h-[44px]" aria-label="Frequency">
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
              <Button variant="outline" className="w-full min-h-[44px] justify-start text-left font-normal" aria-label="Select start date">
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{format(formData.startDate, "PPP")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "start"}>
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
              <Button variant="outline" className="w-full min-h-[44px] justify-start text-left font-normal" aria-label="Select end date (optional)">
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>{formData.endDate ? format(formData.endDate, "PPP") : "No end date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "start"}>
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
                  className="w-full min-h-[36px]"
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
            rows={3}
            className="min-h-[80px] text-base"
            aria-describedby="notes-description"
          />
          <span id="notes-description" className="sr-only">Optional additional notes about this recurring transaction</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button onClick={handleSubmit} className="flex-1 min-h-[44px]" aria-label={editingTransaction ? 'Update recurring transaction' : 'Add recurring transaction'}>
            {editingTransaction ? 'Update' : 'Add'} Recurring Transaction
          </Button>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="min-h-[44px]">
            Cancel
          </Button>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <TooltipProvider>
    <div className="space-y-4 sm:space-y-6" role="main" aria-label="Recurring transactions management">
      {/* Loading announcement for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && "Loading recurring transactions"}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Recurring Transactions</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Automate your regular income and expenses</p>
        </div>

        {/* Mobile: Sheet, Desktop: Dialog */}
        {isMobile ? (
          <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingTransaction(null); }} className="min-h-[44px] w-full sm:w-auto" aria-label="Add new recurring transaction">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>Add Recurring</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]" aria-labelledby="sheet-title" aria-describedby="sheet-desc">
              <SheetHeader>
                <SheetTitle id="sheet-title">
                  {editingTransaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
                </SheetTitle>
                <SheetDescription id="sheet-desc">
                  {editingTransaction
                    ? 'Update your recurring transaction details'
                    : 'Set up a transaction that repeats automatically'}
                </SheetDescription>
              </SheetHeader>
              <FormContent />
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingTransaction(null); }} className="min-h-[44px]" aria-label="Add new recurring transaction">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>Add Recurring</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg" aria-labelledby="recurring-dialog-title" aria-describedby="recurring-dialog-desc">
            <DialogHeader>
              <DialogTitle id="recurring-dialog-title">
                {editingTransaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
              </DialogTitle>
              <DialogDescription id="recurring-dialog-desc">
                {editingTransaction
                  ? 'Update your recurring transaction details'
                  : 'Set up a transaction that repeats automatically'}
              </DialogDescription>
            </DialogHeader>
            <FormContent />
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Upcoming Transactions Collapsible */}
      {upcomingTransactions.length > 0 && (
        <Collapsible open={showUpcoming} onOpenChange={setShowUpcoming}>
          <CollapsibleTrigger asChild>
            <Button
              variant={showUpcoming ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 min-h-[44px] w-full sm:w-auto"
              aria-expanded={showUpcoming}
              aria-controls="upcoming-transactions-section"
              aria-label={`${showUpcoming ? 'Hide' : 'Show'} upcoming transactions`}
            >
              <CalendarIconSmall className="h-4 w-4" aria-hidden="true" />
              <span>{showUpcoming ? 'Hide Upcoming' : 'Show Upcoming'} ({upcomingTransactions.length})</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showUpcoming ? 'rotate-180' : ''}`} aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent id="upcoming-transactions-section" role="region" aria-label="Upcoming transactions">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CalendarIconSmall className="h-5 w-5" aria-hidden="true" />
                  <span>Upcoming (Next 30 Days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-auto max-h-[400px]">
                  <div className="space-y-3 pr-4">
                    {upcomingTransactions.slice(0, 10).map(({ recurring, dueDate }, index) => (
                      <div
                        key={`${recurring.id}-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 focus-within:ring-2 focus-within:ring-ring"
                        role="article"
                        aria-label={`${recurring.description} due ${format(dueDate, "MMM d, yyyy")}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`p-3 rounded-lg shrink-0 ${
                              recurring.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                            }`}
                            aria-hidden="true"
                          >
                            {recurring.type === 'income' ?
                              <TrendingUp className="h-5 w-5 text-income" /> :
                              <TrendingDown className="h-5 w-5 text-expense" />
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{recurring.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(dueDate, "MMM d, yyyy")} • {getFrequencyDisplay(recurring.frequency)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p
                            className={`text-lg font-semibold ${
                              recurring.type === 'income' ? 'text-income' : 'text-expense'
                            }`}
                          >
                            ${recurring.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">{recurring.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Active Recurring Transactions */}
      {activeTransactions.length > 0 && (
        <Card role="region" aria-label="Active recurring transactions">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Active Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-3">
              {activeTransactions.map(transaction => (
                <AccordionItem
                  key={transaction.id}
                  value={transaction.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div
                        className={`p-3 rounded-lg shrink-0 ${
                          transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                        }`}
                        aria-hidden="true"
                      >
                        {transaction.type === 'income' ?
                          <TrendingUp className="h-5 w-5 text-income" /> :
                          <TrendingDown className="h-5 w-5 text-expense" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate text-base">{transaction.description}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                          <span>{getFrequencyDisplay(transaction.frequency)}</span>
                          <span>•</span>
                          <span className="text-xs sm:text-sm">{getNextOccurrenceText(transaction)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-income' : 'text-expense'
                          }`}
                        >
                          ${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-4 pl-14">
                      {/* Transaction Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium">{transaction.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Account:</span>
                          <p className="font-medium">
                            {accounts.find(a => a.id === transaction.accountId)?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {transaction.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="mt-1">{transaction.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 pt-2">
                        {/* Row 1: Edit and Pause (+ Delete on larger screens) */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="min-h-[44px] flex-1 sm:flex-initial"
                            aria-label={`Edit ${transaction.description}`}
                          >
                            <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(transaction.id)}
                            className="min-h-[44px] flex-1 sm:flex-initial"
                            aria-label={`Pause ${transaction.description}`}
                          >
                            <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                            <span>Pause</span>
                          </Button>
                          {/* Delete button - hidden at ≤400px, visible above */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="max-[400px]:hidden min-h-[44px] flex-1 sm:flex-initial text-destructive hover:text-destructive"
                                aria-label={`Delete ${transaction.description}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                                <span>Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{transaction.description}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="min-h-[44px] sm:min-h-[36px]">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction.id)}
                                  className="min-h-[44px] sm:min-h-[36px]"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Row 2: Delete button - visible only at ≤400px */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-[401px]:hidden min-h-[44px] w-full text-destructive hover:text-destructive"
                              aria-label={`Delete ${transaction.description}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                              <span>Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{transaction.description}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="min-h-[44px] sm:min-h-[36px]">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                                className="min-h-[44px] sm:min-h-[36px]"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Inactive Recurring Transactions */}
      {inactiveTransactions.length > 0 && (
        <Card role="region" aria-label="Inactive recurring transactions">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-base sm:text-lg">Inactive Recurring Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg opacity-60 gap-3"
                  role="article"
                  aria-label={`Inactive: ${transaction.description}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-3 rounded-lg bg-muted shrink-0" aria-hidden="true">
                      <Pause className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-muted-foreground truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {getFrequencyDisplay(transaction.frequency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <p className="text-muted-foreground font-medium">${transaction.amount.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(transaction.id)}
                        className="min-h-[44px] min-w-[44px]"
                        aria-label={`Activate ${transaction.description}`}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Activate</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-[44px] min-w-[44px]"
                            aria-label={`Delete ${transaction.description}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{transaction.description}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="min-h-[44px] sm:min-h-[36px]">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id)}
                              className="min-h-[44px] sm:min-h-[36px]"
                            >
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

      {/* Empty State */}
      {recurringTransactions.length === 0 && !isLoading && (
        <Card role="status" aria-label="No recurring transactions">
          <CardContent className="text-center py-12 px-4">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Recurring Transactions</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Set up recurring transactions to automate your regular income and expenses.
            </p>
            <Button
              onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
              className="min-h-[44px]"
              aria-label="Add your first recurring transaction"
            >
              <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
              <span>Add Your First Recurring Transaction</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </TooltipProvider>
  );
};