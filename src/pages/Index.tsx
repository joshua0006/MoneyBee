import { useState, useEffect } from "react";
import { ExpenseOverview } from "@/components/ExpenseOverview";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import { ExpenseList } from "@/components/ExpenseList";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { TransactionDetail } from "@/components/TransactionDetail";
import { CalendarView } from "@/components/CalendarView";
import { BudgetManager } from "@/components/BudgetManager";
import { AccountManager } from "@/components/AccountManager";
import { RecurringTransactionManager } from "@/components/RecurringTransactionManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, BarChart3, Search, Plus, PieChart, Calendar, Target, Settings, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  saveExpensesToStorage, 
  loadExpensesFromStorage, 
  saveAccountsToStorage,
  loadAccountsFromStorage,
  saveBudgetsToStorage,
  loadBudgetsFromStorage,
  exportExpensesAsCSV,
  type Expense,
  type Account,
  type Budget
} from "@/utils/expenseUtils";

const Index = () => {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mainTab, setMainTab] = useState("overview");
  const [moreTab, setMoreTab] = useState("search");
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    const loadedExpenses = loadExpensesFromStorage();
    const loadedAccounts = loadAccountsFromStorage();
    const loadedBudgets = loadBudgetsFromStorage();
    
    setAllExpenses(loadedExpenses);
    setFilteredExpenses(loadedExpenses);
    setAccounts(loadedAccounts);
    setBudgets(loadedBudgets);
    setIsLoading(false);
  }, []);

  // Save data whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveExpensesToStorage(allExpenses);
    }
  }, [allExpenses, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveAccountsToStorage(accounts);
    }
  }, [accounts, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveBudgetsToStorage(budgets);
    }
  }, [budgets, isLoading]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setAllExpenses(prev => [newExpense, ...prev]);
  };

  const handleAddAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString()
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const handleAddBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString()
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(budget => budget.id === updatedBudget.id ? updatedBudget : budget));
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  };

  const handleFilteredResults = (filtered: Expense[]) => {
    setFilteredExpenses(filtered);
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setAllExpenses(prev => prev.filter(e => e.id !== id));
    setFilteredExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleEditExpense = (expense: Expense) => {
    setAllExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    setFilteredExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    setIsDetailOpen(false);
  };

  const handleExport = () => {
    try {
      exportExpensesAsCSV(filteredExpenses);
      toast({
        title: "📊 Export Successful",
        description: `Exported ${filteredExpenses.length} transactions`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export expense data",
        variant: "destructive"
      });
    }
  };

  const handleViewAllTransactions = () => {
    setMainTab("more");
    setMoreTab("search");
  };

  const totalIncome = allExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = allExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-card via-muted/30 to-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-expense/10 rounded-xl shadow-sm">
                <Wallet className="h-6 w-6 text-expense" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Expense Tracker
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Smart expense management</p>
                  <Badge variant="secondary" className="text-xs">
                    {allExpenses.length} transactions
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="p-2 bg-income/10 rounded-xl shadow-sm">
                <TrendingUp className="h-5 w-5 text-income" />
              </div>
              <div className="p-2 bg-primary/10 rounded-xl shadow-sm">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <BarChart3 size={14} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1 text-xs">
              <Plus size={14} />
              Add
            </TabsTrigger>
            <TabsTrigger value="more" className="flex items-center gap-1 text-xs">
              <Settings size={14} />
              More
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview */}
            <ExpenseOverview 
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />

            {/* Category Breakdown */}
            <CategoryBreakdown expenses={allExpenses} />

            {/* Recent Transactions */}
            <ExpenseList 
              expenses={allExpenses.slice(0, 5)} 
              onExpenseClick={handleExpenseClick}
            />
            
            {allExpenses.length > 5 && (
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={handleViewAllTransactions}>
                  View All {allExpenses.length} Transactions
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <EnhancedQuickAddExpense 
              onAddExpense={handleAddExpense}
              existingExpenses={allExpenses}
              accounts={accounts}
            />
          </TabsContent>

          <TabsContent value="more" className="space-y-6">
            <Tabs value={moreTab} onValueChange={setMoreTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-6 bg-muted/30 p-1">
                <TabsTrigger value="search" className="flex flex-col items-center gap-1 text-xs p-2">
                  <Search size={14} />
                  Search
                </TabsTrigger>
                <TabsTrigger value="recurring" className="flex flex-col items-center gap-1 text-xs p-2">
                  <Clock size={14} />
                  Recurring
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex flex-col items-center gap-1 text-xs p-2">
                  <Calendar size={14} />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex flex-col items-center gap-1 text-xs p-2">
                  <Target size={14} />
                  Budget
                </TabsTrigger>
                <TabsTrigger value="accounts" className="flex flex-col items-center gap-1 text-xs p-2">
                  <Wallet size={14} />
                  Accounts
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 text-xs p-2">
                  <PieChart size={14} />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                <SearchAndFilter 
                  expenses={allExpenses}
                  onFilteredResults={handleFilteredResults}
                  onExport={handleExport}
                />
                <ExpenseList 
                  expenses={filteredExpenses} 
                  onExpenseClick={handleExpenseClick}
                />
              </TabsContent>

              <TabsContent value="recurring" className="space-y-4">
                <RecurringTransactionManager 
                  accounts={accounts}
                  onGenerateExpenses={(expenses) => {
                    expenses.forEach(expense => handleAddExpense(expense));
                  }}
                />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <CalendarView 
                  expenses={allExpenses}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </TabsContent>

              <TabsContent value="budget" className="space-y-4">
                <BudgetManager 
                  budgets={budgets}
                  expenses={allExpenses}
                  onAddBudget={handleAddBudget}
                  onUpdateBudget={handleUpdateBudget}
                  onDeleteBudget={handleDeleteBudget}
                />
              </TabsContent>

              <TabsContent value="accounts" className="space-y-4">
                <AccountManager 
                  accounts={accounts}
                  expenses={allExpenses}
                  onAddAccount={handleAddAccount}
                  onUpdateAccount={handleUpdateAccount}
                  onDeleteAccount={handleDeleteAccount}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <AdvancedAnalytics expenses={allExpenses} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Transaction Detail Modal */}
        <TransactionDetail 
          expense={selectedExpense}
          account={accounts.find(acc => acc.id === selectedExpense?.accountId)}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onDelete={handleDeleteExpense}
          onEdit={handleEditExpense}
        />
      </div>
    </div>
  );
};

export default Index;
