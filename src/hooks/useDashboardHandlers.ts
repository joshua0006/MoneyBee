import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { mobileService } from "@/utils/mobileService";
import type { Expense, Account, Budget } from '@/types/app';

interface UseDashboardHandlersProps {
  saveExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpenseData: (id: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  saveAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccountData: (id: string, account: Account) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  saveBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudgetData: (id: string, budget: Budget) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  filteredExpenses: Expense[];
  setSelectedExpense: (expense: Expense | null) => void;
  setIsDetailOpen: (open: boolean) => void;
  setEditingExpense: (expense: Expense | null) => void;
  setIsAddExpenseOpen: (open: boolean) => void;
  setActiveMenuItem: (item: string | null) => void;
}

export const useDashboardHandlers = (props: UseDashboardHandlersProps) => {
  const { toast } = useToast();

  const handleAddExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    await props.saveExpense(expense);
    mobileService.successHaptic();
  }, [props.saveExpense]);

  const handleAddAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    await props.saveAccount(account);
    mobileService.successHaptic();
  }, [props.saveAccount]);

  const handleUpdateAccount = useCallback(async (updatedAccount: Account) => {
    await props.updateAccountData(updatedAccount.id, updatedAccount);
    mobileService.lightHaptic();
  }, [props.updateAccountData]);

  const handleDeleteAccount = useCallback(async (id: string) => {
    await props.removeAccount(id);
    mobileService.errorHaptic();
  }, [props.removeAccount]);

  const handleAddBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    await props.saveBudget(budget);
    mobileService.successHaptic();
  }, [props.saveBudget]);

  const handleUpdateBudget = useCallback(async (updatedBudget: Budget) => {
    await props.updateBudgetData(updatedBudget.id, updatedBudget);
    mobileService.lightHaptic();
  }, [props.updateBudgetData]);

  const handleDeleteBudget = useCallback(async (id: string) => {
    await props.removeBudget(id);
    mobileService.errorHaptic();
  }, [props.removeBudget]);

  const handleExpenseClick = useCallback((expense: Expense) => {
    props.setSelectedExpense(expense);
    props.setIsDetailOpen(true);
  }, [props.setSelectedExpense, props.setIsDetailOpen]);

  const handleDeleteExpense = useCallback(async (id: string) => {
    await props.removeExpense(id);
    mobileService.errorHaptic();
  }, [props.removeExpense]);

  const handleEditExpense = useCallback((expense: Expense) => {
    props.setEditingExpense(expense);
    props.setIsDetailOpen(false);
    props.setIsAddExpenseOpen(true); // Open the expense form for editing
  }, [props.setEditingExpense, props.setIsDetailOpen, props.setIsAddExpenseOpen]);

  const handleUpdateExpense = useCallback(async (updatedExpense: Omit<Expense, 'id'>, editingExpense: Expense | null) => {
    if (!editingExpense) return;

    await props.updateExpenseData(editingExpense.id, updatedExpense);
    props.setEditingExpense(null);
    props.setIsAddExpenseOpen(false); // Close the sheet after update
    mobileService.successHaptic();
  }, [props.updateExpenseData, props.setEditingExpense, props.setIsAddExpenseOpen]);

  const handleExport = useCallback(() => {
    try {
      // Simple CSV export functionality
      const csvContent = [
        ['Date', 'Description', 'Category', 'Amount', 'Type'],
        ...props.filteredExpenses.map(expense => [
          expense.date.toISOString().split('T')[0],
          expense.description,
          expense.category,
          expense.amount.toString(),
          expense.type
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "📊 Export Successful",
        description: `Exported ${props.filteredExpenses.length} transactions`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export expense data",
        variant: "destructive"
      });
    }
  }, [props.filteredExpenses, toast]);

  const handleViewAllTransactions = useCallback(() => {
    mobileService.lightHaptic();
    props.setActiveMenuItem("search");
  }, [props.setActiveMenuItem]);

  const handleRefresh = useCallback(async () => {
    mobileService.lightHaptic();
    await props.refreshData();
  }, [props.refreshData]);

  return {
    handleAddExpense,
    handleAddAccount,
    handleUpdateAccount,
    handleDeleteAccount,
    handleAddBudget,
    handleUpdateBudget,
    handleDeleteBudget,
    handleExpenseClick,
    handleDeleteExpense,
    handleEditExpense,
    handleUpdateExpense,
    handleExport,
    handleViewAllTransactions,
    handleRefresh
  };
};