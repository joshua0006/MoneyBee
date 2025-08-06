import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';
import {
  loadExpensesFromDatabase,
  loadAccountsFromDatabase,
  loadBudgetsFromDatabase,
  saveExpenseToDatabase,
  saveAccountToDatabase,
  saveBudgetToDatabase,
  updateExpenseInDatabase,
  updateAccountInDatabase,
  updateBudgetInDatabase,
  deleteExpenseFromDatabase,
  deleteAccountFromDatabase,
  deleteBudgetFromDatabase,
  migrateLocalStorageToDatabase
} from '@/utils/supabaseExpenseUtils';
import type { 
  Expense, 
  Account, 
  Budget
} from '@/types/app';
import {
  convertDbExpenseToApp,
  convertDbAccountToApp,
  convertDbBudgetToApp,
  convertAppExpenseToDb,
  convertAppAccountToDb,
  convertAppBudgetToDb
} from '@/types/app';

export interface AppDataHook {
  expenses: Expense[];
  accounts: Account[];
  budgets: Budget[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAppData = (): AppDataHook => {
  const { user } = useUser();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user is available
  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user?.id]);

  const loadAllData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Check if we need to migrate from localStorage
      const hasLocalData = localStorage.getItem(`${user.id}_expense_tracker_data`) || 
                          localStorage.getItem(`${user.id}_expense_tracker_accounts`) ||
                          localStorage.getItem(`${user.id}_expense_tracker_budgets`);

      if (hasLocalData) {
        await migrateFromLocalStorage();
      }

      // Load data from Supabase
      const [expensesData, accountsData, budgetsData] = await Promise.all([
        loadExpensesFromDatabase(user.id),
        loadAccountsFromDatabase(user.id),
        loadBudgetsFromDatabase(user.id)
      ]);

      // Convert to app types
      setExpenses(expensesData.map(convertDbExpenseToApp));
      setAccounts(accountsData.map(convertDbAccountToApp));
      setBudgets(budgetsData.map(convertDbBudgetToApp));

      toast({
        title: "Data synced",
        description: "Your financial data is up to date",
        duration: 2000
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Sync error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const migrateFromLocalStorage = async () => {
    if (!user?.id) return;

    try {
      // Load from localStorage
      const localExpenses = JSON.parse(localStorage.getItem(`${user.id}_expense_tracker_data`) || '[]');
      const localAccounts = JSON.parse(localStorage.getItem(`${user.id}_expense_tracker_accounts`) || '[]');
      const localBudgets = JSON.parse(localStorage.getItem(`${user.id}_expense_tracker_budgets`) || '[]');

      // Migrate each type of data
      if (localExpenses.length > 0) {
        for (const expense of localExpenses) {
          const expenseData = convertAppExpenseToDb({
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: new Date(expense.date),
            type: expense.type || 'expense',
            accountId: expense.accountId
          }, user.id);
          await saveExpenseToDatabase(expenseData);
        }
      }

      if (localAccounts.length > 0) {
        for (const account of localAccounts) {
          const accountData = convertAppAccountToDb({
            name: account.name,
            type: account.type || 'checking',
            balance: account.balance || 0,
            color: account.color
          }, user.id);
          await saveAccountToDatabase(accountData);
        }
      }

      if (localBudgets.length > 0) {
        for (const budget of localBudgets) {
          const budgetData = convertAppBudgetToDb({
            category: budget.category,
            amount: budget.amount,
            period: budget.period || 'monthly',
            startDate: new Date(budget.startDate)
          }, user.id);
          await saveBudgetToDatabase(budgetData);
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`${user.id}_expense_tracker_data`);
      localStorage.removeItem(`${user.id}_expense_tracker_accounts`);
      localStorage.removeItem(`${user.id}_expense_tracker_budgets`);

      toast({
        title: "Data migrated",
        description: "Your local data has been moved to the cloud",
        duration: 3000
      });
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration failed",
        description: "Failed to migrate local data. Your data is still safe locally.",
        variant: "destructive"
      });
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user?.id) return;

    try {
      const expenseData = convertAppExpenseToDb(expense, user.id);
      const newExpense = await saveExpenseToDatabase(expenseData);

      if (newExpense) {
        setExpenses(prev => [convertDbExpenseToApp(newExpense), ...prev]);
        toast({
          title: "Expense added",
          description: "Your expense has been saved",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Save failed",
        description: "Failed to save expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      // Convert app updates to database format
      const dbUpdates: any = {};
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.date !== undefined) dbUpdates.date = updates.date.toISOString().split('T')[0];
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.accountId !== undefined) dbUpdates.account_id = updates.accountId;

      const updatedExpense = await updateExpenseInDatabase(id, dbUpdates);
      if (updatedExpense) {
        setExpenses(prev => prev.map(exp => exp.id === id ? convertDbExpenseToApp(updatedExpense) : exp));
        toast({
          title: "Expense updated",
          description: "Your changes have been saved",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Update failed",
        description: "Failed to update expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteExpenseFromDatabase(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast({
        title: "Expense deleted",
        description: "The expense has been removed",
        duration: 2000
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    if (!user?.id) return;

    try {
      const accountData = convertAppAccountToDb(account, user.id);
      const newAccount = await saveAccountToDatabase(accountData);

      if (newAccount) {
        setAccounts(prev => [...prev, convertDbAccountToApp(newAccount)]);
        toast({
          title: "Account added",
          description: "Your account has been created",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Save failed",
        description: "Failed to save account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      // Convert app updates to database format
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
      if (updates.color !== undefined) dbUpdates.color = updates.color;

      const updatedAccount = await updateAccountInDatabase(id, dbUpdates);
      if (updatedAccount) {
        setAccounts(prev => prev.map(acc => acc.id === id ? convertDbAccountToApp(updatedAccount) : acc));
        toast({
          title: "Account updated",
          description: "Your changes have been saved",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Update failed",
        description: "Failed to update account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await deleteAccountFromDatabase(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast({
        title: "Account deleted",
        description: "The account has been removed",
        duration: 2000
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user?.id) return;

    try {
      const budgetData = convertAppBudgetToDb(budget, user.id);
      const newBudget = await saveBudgetToDatabase(budgetData);

      if (newBudget) {
        setBudgets(prev => [...prev, convertDbBudgetToApp(newBudget)]);
        toast({
          title: "Budget created",
          description: "Your budget has been set",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Save failed",
        description: "Failed to save budget. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      // Convert app updates to database format
      const dbUpdates: any = {};
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.period !== undefined) dbUpdates.period = updates.period;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString().split('T')[0];

      const updatedBudget = await updateBudgetInDatabase(id, dbUpdates);
      if (updatedBudget) {
        setBudgets(prev => prev.map(budget => budget.id === id ? convertDbBudgetToApp(updatedBudget) : budget));
        toast({
          title: "Budget updated",
          description: "Your changes have been saved",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Update failed",
        description: "Failed to update budget. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await deleteBudgetFromDatabase(id);
      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast({
        title: "Budget deleted",
        description: "The budget has been removed",
        duration: 2000
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  return {
    expenses,
    accounts,
    budgets,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    addAccount,
    updateAccount,
    deleteAccount,
    addBudget,
    updateBudget,
    deleteBudget,
    refreshData
  };
};