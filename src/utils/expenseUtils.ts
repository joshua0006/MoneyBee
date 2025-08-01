interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  color: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
  accountId: string;
  photos?: string[];
  location?: string;
  tags?: string[];
  recurring?: boolean;
}

// Local storage utilities
export const STORAGE_KEY = 'expense_tracker_data';
export const ACCOUNTS_KEY = 'expense_tracker_accounts';
export const BUDGETS_KEY = 'expense_tracker_budgets';

export const saveExpensesToStorage = (expenses: Expense[]): void => {
  try {
    const serializedExpenses = expenses.map(expense => ({
      ...expense,
      date: expense.date.toISOString()
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedExpenses));
  } catch (error) {
    console.error('Failed to save expenses to localStorage:', error);
  }
};

export const loadExpensesFromStorage = (): Expense[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultExpenses();
    
    const parsed = JSON.parse(stored);
    return parsed.map((expense: any) => ({
      ...expense,
      date: new Date(expense.date)
    }));
  } catch (error) {
    console.error('Failed to load expenses from localStorage:', error);
    return getDefaultExpenses();
  }
};

// Default sample expenses for new users
const getDefaultExpenses = (): Expense[] => [
  {
    id: '1',
    amount: 15.50,
    description: 'Coffee and pastry',
    category: 'Food & Dining',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'expense',
    accountId: 'main'
  },
  {
    id: '2',
    amount: 45.00,
    description: 'Gas station',
    category: 'Transportation',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    type: 'expense',
    accountId: 'main'
  },
  {
    id: '3',
    amount: 3200.00,
    description: 'Monthly salary',
    category: 'Other',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    type: 'income',
    accountId: 'main'
  }
];

const getDefaultAccounts = (): Account[] => [
  {
    id: 'main',
    name: 'Main Account',
    type: 'checking',
    balance: 2500.00,
    color: 'hsl(var(--primary))'
  }
];

const getDefaultBudgets = (): Budget[] => [
  {
    id: '1',
    category: 'Food & Dining',
    amount: 500,
    period: 'monthly',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  },
  {
    id: '2',
    category: 'Transportation',
    amount: 200,
    period: 'monthly',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  }
];

// Smart suggestions based on previous entries
export const getSmartSuggestions = (expenses: Expense[], currentInput: string): string[] => {
  if (!currentInput || currentInput.length < 2) return [];

  const descriptions = expenses
    .map(e => e.description.toLowerCase())
    .filter(desc => desc.includes(currentInput.toLowerCase()))
    .filter((desc, index, arr) => arr.indexOf(desc) === index) // Remove duplicates
    .slice(0, 5); // Limit to 5 suggestions

  return descriptions;
};

// Export functionality
export const exportExpensesAsCSV = (expenses: Expense[]): void => {
  const headers = ['Date', 'Type', 'Amount', 'Description', 'Category'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      expense.date.toLocaleDateString(),
      expense.type,
      expense.amount.toFixed(2),
      `"${expense.description}"`, // Wrap in quotes to handle commas
      expense.category
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Analytics helpers
export const calculateMonthlyTrends = (expenses: Expense[]) => {
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  expenses.forEach(expense => {
    const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    if (expense.type === 'income') {
      monthlyData[monthKey].income += expense.amount;
    } else {
      monthlyData[monthKey].expenses += expense.amount;
    }
  });
  
  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ...data,
      net: data.income - data.expenses
    }));
};

export const getTopSpendingCategories = (expenses: Expense[], limit = 5) => {
  const categoryTotals = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category, amount]) => ({ category, amount }));
};

// Account management
export const saveAccountsToStorage = (accounts: Account[]): void => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save accounts to localStorage:', error);
  }
};

export const loadAccountsFromStorage = (): Account[] => {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (!stored) return getDefaultAccounts();
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load accounts from localStorage:', error);
    return getDefaultAccounts();
  }
};

// Budget management
export const saveBudgetsToStorage = (budgets: Budget[]): void => {
  try {
    const serializedBudgets = budgets.map(budget => ({
      ...budget,
      startDate: budget.startDate.toISOString()
    }));
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(serializedBudgets));
  } catch (error) {
    console.error('Failed to save budgets to localStorage:', error);
  }
};

export const loadBudgetsFromStorage = (): Budget[] => {
  try {
    const stored = localStorage.getItem(BUDGETS_KEY);
    if (!stored) return getDefaultBudgets();
    
    const parsed = JSON.parse(stored);
    return parsed.map((budget: any) => ({
      ...budget,
      startDate: new Date(budget.startDate)
    }));
  } catch (error) {
    console.error('Failed to load budgets from localStorage:', error);
    return getDefaultBudgets();
  }
};

// Budget calculations
export const calculateBudgetUsage = (expenses: Expense[], budget: Budget): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return expenses
    .filter(e => 
      e.type === 'expense' && 
      e.category === budget.category &&
      e.date.getMonth() === currentMonth &&
      e.date.getFullYear() === currentYear
    )
    .reduce((sum, e) => sum + e.amount, 0);
};

export { type Expense, type Account, type Budget };