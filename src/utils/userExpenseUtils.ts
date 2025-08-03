import { useUser } from '@clerk/clerk-react';
import { Expense, Account, Budget } from './expenseUtils';

// User-specific storage utilities
export const getUserStorageKey = (userId: string, key: string): string => {
  return `${userId}_${key}`;
};

export const saveUserExpensesToStorage = (userId: string, expenses: Expense[]): void => {
  try {
    const serializedExpenses = expenses.map(expense => ({
      ...expense,
      date: expense.date.toISOString()
    }));
    const key = getUserStorageKey(userId, 'expense_tracker_data');
    localStorage.setItem(key, JSON.stringify(serializedExpenses));
  } catch (error) {
    console.error('Failed to save user expenses to localStorage:', error);
  }
};

export const loadUserExpensesFromStorage = (userId: string): Expense[] => {
  try {
    const key = getUserStorageKey(userId, 'expense_tracker_data');
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((expense: any) => ({
      ...expense,
      date: new Date(expense.date)
    }));
  } catch (error) {
    console.error('Failed to load user expenses from localStorage:', error);
    return [];
  }
};

export const saveUserAccountsToStorage = (userId: string, accounts: Account[]): void => {
  try {
    const key = getUserStorageKey(userId, 'expense_tracker_accounts');
    localStorage.setItem(key, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save user accounts to localStorage:', error);
  }
};

export const loadUserAccountsFromStorage = (userId: string): Account[] => {
  try {
    const key = getUserStorageKey(userId, 'expense_tracker_accounts');
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load user accounts from localStorage:', error);
    return [];
  }
};

export const saveUserBudgetsToStorage = (userId: string, budgets: Budget[]): void => {
  try {
    const serializedBudgets = budgets.map(budget => ({
      ...budget,
      startDate: budget.startDate.toISOString()
    }));
    const key = getUserStorageKey(userId, 'expense_tracker_budgets');
    localStorage.setItem(key, JSON.stringify(serializedBudgets));
  } catch (error) {
    console.error('Failed to save user budgets to localStorage:', error);
  }
};

export const loadUserBudgetsFromStorage = (userId: string): Budget[] => {
  try {
    const key = getUserStorageKey(userId, 'expense_tracker_budgets');
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((budget: any) => ({
      ...budget,
      startDate: new Date(budget.startDate)
    }));
  } catch (error) {
    console.error('Failed to load user budgets from localStorage:', error);
    return [];
  }
};

// Migration utility to move existing data to user-specific storage
export const migrateToUserStorage = (userId: string): void => {
  try {
    // Check if user already has data
    const userExpensesKey = getUserStorageKey(userId, 'expense_tracker_data');
    const existingUserData = localStorage.getItem(userExpensesKey);
    
    if (existingUserData) {
      // User already has data, don't migrate
      return;
    }
    
    // Migrate existing data from old keys
    const oldExpenses = localStorage.getItem('expense_tracker_data');
    const oldAccounts = localStorage.getItem('expense_tracker_accounts');
    const oldBudgets = localStorage.getItem('expense_tracker_budgets');
    
    if (oldExpenses) {
      localStorage.setItem(userExpensesKey, oldExpenses);
    }
    
    if (oldAccounts) {
      const userAccountsKey = getUserStorageKey(userId, 'expense_tracker_accounts');
      localStorage.setItem(userAccountsKey, oldAccounts);
    }
    
    if (oldBudgets) {
      const userBudgetsKey = getUserStorageKey(userId, 'expense_tracker_budgets');
      localStorage.setItem(userBudgetsKey, oldBudgets);
    }
    
    // Optionally remove old keys (uncomment if you want to clean up)
    // localStorage.removeItem('expense_tracker_data');
    // localStorage.removeItem('expense_tracker_accounts');
    // localStorage.removeItem('expense_tracker_budgets');
    
    console.log('Data migration completed for user:', userId);
  } catch (error) {
    console.error('Failed to migrate data for user:', error);
  }
};

// Hook to get user-specific data management functions
export const useUserDataManager = () => {
  const { user } = useUser();
  
  if (!user) {
    throw new Error('User must be authenticated to use data manager');
  }
  
  const userId = user.id;
  
  return {
    userId,
    saveExpenses: (expenses: Expense[]) => saveUserExpensesToStorage(userId, expenses),
    loadExpenses: () => loadUserExpensesFromStorage(userId),
    saveAccounts: (accounts: Account[]) => saveUserAccountsToStorage(userId, accounts),
    loadAccounts: () => loadUserAccountsFromStorage(userId),
    saveBudgets: (budgets: Budget[]) => saveUserBudgetsToStorage(userId, budgets),
    loadBudgets: () => loadUserBudgetsFromStorage(userId),
    migrateData: () => migrateToUserStorage(userId),
  };
};