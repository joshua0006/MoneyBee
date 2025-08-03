interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
  accountId: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly/quarterly/yearly
  isActive: boolean;
  nextDueDate: Date;
  lastGenerated?: Date;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RECURRING_STORAGE_KEY = 'expense_tracker_recurring';

// Save/Load functions
export const saveRecurringToStorage = (recurring: RecurringTransaction[]): void => {
  try {
    const serialized = recurring.map(r => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate?.toISOString(),
      nextDueDate: r.nextDueDate.toISOString(),
      lastGenerated: r.lastGenerated?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    }));
    localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save recurring transactions:', error);
  }
};

export const loadRecurringFromStorage = (): RecurringTransaction[] => {
  try {
    const stored = localStorage.getItem(RECURRING_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((r: any) => ({
      ...r,
      startDate: new Date(r.startDate),
      endDate: r.endDate ? new Date(r.endDate) : undefined,
      nextDueDate: new Date(r.nextDueDate),
      lastGenerated: r.lastGenerated ? new Date(r.lastGenerated) : undefined,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load recurring transactions:', error);
    return [];
  }
};

// Calculate next due date based on frequency
export const calculateNextDueDate = (
  lastDate: Date, 
  frequency: RecurringTransaction['frequency'],
  dayOfWeek?: number,
  dayOfMonth?: number
): Date => {
  const next = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      if (dayOfWeek !== undefined) {
        const dayDiff = dayOfWeek - next.getDay();
        next.setDate(next.getDate() + dayDiff + (dayDiff <= 0 ? 7 : 0));
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
  }
  
  return next;
};

// Check for due recurring transactions and generate expenses
export const processDueRecurringTransactions = (
  recurringList: RecurringTransaction[], 
  currentDate: Date = new Date()
): { expenses: any[], updatedRecurring: RecurringTransaction[] } => {
  const generatedExpenses: any[] = [];
  const updatedRecurring: RecurringTransaction[] = [];
  
  recurringList.forEach(recurring => {
    if (!recurring.isActive) {
      updatedRecurring.push(recurring);
      return;
    }
    
    // Check if end date has passed
    if (recurring.endDate && currentDate > recurring.endDate) {
      updatedRecurring.push({ ...recurring, isActive: false });
      return;
    }
    
    // Check if due
    if (currentDate >= recurring.nextDueDate) {
      // Generate expense
      const newExpense = {
        id: `recurring_${recurring.id}_${Date.now()}`,
        amount: recurring.amount,
        description: recurring.description,
        category: recurring.category,
        date: new Date(recurring.nextDueDate),
        type: recurring.type,
        accountId: recurring.accountId,
        tags: [...(recurring.tags || []), 'recurring'],
        recurring: true,
        recurringId: recurring.id
      };
      
      generatedExpenses.push(newExpense);
      
      // Update recurring transaction
      const nextDue = calculateNextDueDate(
        recurring.nextDueDate, 
        recurring.frequency,
        recurring.dayOfWeek,
        recurring.dayOfMonth
      );
      
      updatedRecurring.push({
        ...recurring,
        nextDueDate: nextDue,
        lastGenerated: new Date(recurring.nextDueDate),
        updatedAt: currentDate
      });
    } else {
      updatedRecurring.push(recurring);
    }
  });
  
  return { expenses: generatedExpenses, updatedRecurring };
};

// Get upcoming recurring transactions (next 30 days)
export const getUpcomingRecurring = (
  recurringList: RecurringTransaction[],
  daysAhead: number = 30
): { recurring: RecurringTransaction, dueDate: Date }[] => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);
  
  const upcoming: { recurring: RecurringTransaction, dueDate: Date }[] = [];
  
  recurringList.forEach(recurring => {
    if (!recurring.isActive) return;
    
    let currentDue = new Date(recurring.nextDueDate);
    
    while (currentDue <= future) {
      if (currentDue >= now) {
        // Check if end date hasn't passed
        if (!recurring.endDate || currentDue <= recurring.endDate) {
          upcoming.push({ recurring, dueDate: new Date(currentDue) });
        }
      }
      
      currentDue = calculateNextDueDate(
        currentDue, 
        recurring.frequency,
        recurring.dayOfWeek,
        recurring.dayOfMonth
      );
    }
  });
  
  return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

// Create recurring transaction from regular expense
export const createRecurringFromExpense = (
  expense: any,
  frequency: RecurringTransaction['frequency'],
  startDate?: Date,
  endDate?: Date
): Omit<RecurringTransaction, 'id'> => {
  const start = startDate || new Date();
  const dayOfWeek = frequency === 'weekly' ? start.getDay() : undefined;
  const dayOfMonth = frequency !== 'weekly' ? start.getDate() : undefined;
  
  return {
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
    type: expense.type,
    accountId: expense.accountId,
    frequency,
    startDate: start,
    endDate,
    dayOfWeek,
    dayOfMonth,
    isActive: true,
    nextDueDate: calculateNextDueDate(start, frequency, dayOfWeek, dayOfMonth),
    tags: expense.tags || [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Frequency display helpers
export const getFrequencyDisplay = (frequency: RecurringTransaction['frequency']): string => {
  const displays = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  };
  return displays[frequency];
};

export const getNextOccurrenceText = (recurring: RecurringTransaction): string => {
  const days = Math.ceil((recurring.nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `Due in ${days} days`;
  if (days <= 30) return `Due in ${Math.ceil(days / 7)} weeks`;
  return `Due in ${Math.ceil(days / 30)} months`;
};

export { type RecurringTransaction };