import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval, isWithinInterval } from 'date-fns';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

export interface WeeklyAnalysis {
  currentWeekSpending: number;
  lastWeekSpending: number;
  weeklyChange: number;
  dailyBreakdown: Array<{ day: string; amount: number; date: Date }>;
  averageDailySpending: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
}

export interface MonthlyAnalysis {
  currentMonthSpending: number;
  lastMonthSpending: number;
  monthlyChange: number;
  monthlyTrends: Array<{ month: string; expenses: number; income: number; net: number }>;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  budgetProgress: number;
}

export interface YearlyAnalysis {
  currentYearSpending: number;
  lastYearSpending: number;
  yearlyChange: number;
  monthlyTrends: Array<{ month: string; expenses: number; income: number }>;
  seasonalPatterns: Array<{ season: string; avgSpending: number }>;
  topExpenseMonths: Array<{ month: string; amount: number }>;
}

export interface SmartInsights {
  spendingAlerts: string[];
  patterns: string[];
  recommendations: string[];
  achievements: string[];
}

export const analyzeWeeklyData = (expenses: Expense[]): WeeklyAnalysis => {
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const currentWeekExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    isWithinInterval(e.date, { start: currentWeekStart, end: currentWeekEnd })
  );

  const lastWeekExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    isWithinInterval(e.date, { start: lastWeekStart, end: lastWeekEnd })
  );

  const currentWeekSpending = currentWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastWeekSpending = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyChange = lastWeekSpending > 0 ? ((currentWeekSpending - lastWeekSpending) / lastWeekSpending) * 100 : 0;

  // Daily breakdown for current week
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
  const dailyBreakdown = weekDays.map(day => {
    const dayExpenses = currentWeekExpenses.filter(e => 
      format(e.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    return {
      day: format(day, 'EEE'),
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      date: day
    };
  });

  const averageDailySpending = currentWeekSpending / 7;

  // Top categories this week
  const categoryTotals = currentWeekExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: currentWeekSpending > 0 ? (amount / currentWeekSpending) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return {
    currentWeekSpending,
    lastWeekSpending,
    weeklyChange,
    dailyBreakdown,
    averageDailySpending,
    topCategories
  };
};

export const analyzeMonthlyData = (expenses: Expense[]): MonthlyAnalysis => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    isWithinInterval(e.date, { start: currentMonthStart, end: currentMonthEnd })
  );

  const lastMonthExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    isWithinInterval(e.date, { start: lastMonthStart, end: lastMonthEnd })
  );

  const currentMonthSpending = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastMonthSpending = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyChange = lastMonthSpending > 0 ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0;

  // 6-month trends
  const sixMonthsAgo = subMonths(now, 5);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
  
  const monthlyTrends = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthExpenses = expenses.filter(e => 
      e.type === 'expense' && 
      isWithinInterval(e.date, { start: monthStart, end: monthEnd })
    );
    
    const monthIncome = expenses.filter(e => 
      e.type === 'income' && 
      isWithinInterval(e.date, { start: monthStart, end: monthEnd })
    );

    const expenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const incomeTotal = monthIncome.reduce((sum, e) => sum + e.amount, 0);

    return {
      month: format(month, 'MMM'),
      expenses: expenseTotal,
      income: incomeTotal,
      net: incomeTotal - expenseTotal
    };
  });

  // Category breakdown for current month
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: currentMonthSpending > 0 ? (amount / currentMonthSpending) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    currentMonthSpending,
    lastMonthSpending,
    monthlyChange,
    monthlyTrends,
    categoryBreakdown,
    budgetProgress: 0 // TODO: Calculate based on budget data
  };
};

export const analyzeYearlyData = (expenses: Expense[]): YearlyAnalysis => {
  const now = new Date();
  const currentYearStart = startOfYear(now);
  const currentYearEnd = endOfYear(now);
  const lastYearStart = startOfYear(subYears(now, 1));
  const lastYearEnd = endOfYear(subYears(now, 1));

  const currentYearExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    isWithinInterval(e.date, { start: currentYearStart, end: currentYearEnd })
  );

  const lastYearExpenses = expenses.filter(e => 
    e.type === 'expense' && 
    isWithinInterval(e.date, { start: lastYearStart, end: lastYearEnd })
  );

  const currentYearSpending = currentYearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastYearSpending = lastYearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const yearlyChange = lastYearSpending > 0 ? ((currentYearSpending - lastYearSpending) / lastYearSpending) * 100 : 0;

  // Monthly trends for current year
  const yearStart = startOfYear(now);
  const months = eachMonthOfInterval({ start: yearStart, end: now });
  
  const monthlyTrends = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthExpenses = expenses.filter(e => 
      e.type === 'expense' && 
      isWithinInterval(e.date, { start: monthStart, end: monthEnd })
    );
    
    const monthIncome = expenses.filter(e => 
      e.type === 'income' && 
      isWithinInterval(e.date, { start: monthStart, end: monthEnd })
    );

    return {
      month: format(month, 'MMM yyyy'),
      expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      income: monthIncome.reduce((sum, e) => sum + e.amount, 0)
    };
  });

  // Seasonal patterns
  const seasons = [
    { name: 'Winter', months: [12, 1, 2] },
    { name: 'Spring', months: [3, 4, 5] },
    { name: 'Summer', months: [6, 7, 8] },
    { name: 'Fall', months: [9, 10, 11] }
  ];

  const seasonalPatterns = seasons.map(season => {
    const seasonExpenses = currentYearExpenses.filter(e => 
      season.months.includes(e.date.getMonth() + 1)
    );
    return {
      season: season.name,
      avgSpending: seasonExpenses.reduce((sum, e) => sum + e.amount, 0) / season.months.length
    };
  });

  // Top expense months
  const monthlyTotals = monthlyTrends.map(trend => ({
    month: trend.month,
    amount: trend.expenses
  })).sort((a, b) => b.amount - a.amount);

  return {
    currentYearSpending,
    lastYearSpending,
    yearlyChange,
    monthlyTrends,
    seasonalPatterns,
    topExpenseMonths: monthlyTotals.slice(0, 3)
  };
};

export const generateSmartInsights = (expenses: Expense[]): SmartInsights => {
  const weeklyData = analyzeWeeklyData(expenses);
  const monthlyData = analyzeMonthlyData(expenses);
  const yearlyData = analyzeYearlyData(expenses);

  const spendingAlerts: string[] = [];
  const patterns: string[] = [];
  const recommendations: string[] = [];
  const achievements: string[] = [];

  // Spending alerts
  if (weeklyData.weeklyChange > 20) {
    spendingAlerts.push(`Your spending increased by ${weeklyData.weeklyChange.toFixed(1)}% this week`);
  }
  
  if (monthlyData.monthlyChange > 15) {
    spendingAlerts.push(`Monthly spending is up ${monthlyData.monthlyChange.toFixed(1)}% from last month`);
  }

  // Patterns
  const highestSpendingDay = weeklyData.dailyBreakdown.reduce((max, day) => 
    day.amount > max.amount ? day : max
  );
  if (highestSpendingDay.amount > 0) {
    patterns.push(`You typically spend most on ${highestSpendingDay.day}s`);
  }

  if (weeklyData.topCategories.length > 0) {
    patterns.push(`${weeklyData.topCategories[0].category} accounts for ${weeklyData.topCategories[0].percentage.toFixed(1)}% of weekly spending`);
  }

  // Recommendations
  if (weeklyData.averageDailySpending > 0) {
    recommendations.push(`Consider setting a daily budget of $${(weeklyData.averageDailySpending * 0.9).toFixed(0)} to reduce spending`);
  }

  if (monthlyData.categoryBreakdown.length > 0) {
    const topCategory = monthlyData.categoryBreakdown[0];
    if (topCategory.percentage > 40) {
      recommendations.push(`${topCategory.category} takes up ${topCategory.percentage.toFixed(1)}% of your budget - consider reducing this category`);
    }
  }

  // Achievements
  if (weeklyData.weeklyChange < -10) {
    achievements.push(`Great job! You reduced spending by ${Math.abs(weeklyData.weeklyChange).toFixed(1)}% this week`);
  }

  if (monthlyData.monthlyTrends.some(trend => trend.net > 0)) {
    achievements.push("You had positive cash flow in recent months!");
  }

  return {
    spendingAlerts,
    patterns,
    recommendations,
    achievements
  };
};