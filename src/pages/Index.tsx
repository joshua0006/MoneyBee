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
import { BottomNavigation } from "@/components/BottomNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, BarChart3, Search, PieChart, Calendar, Target, Settings, Clock } from "lucide-react";
import moneyBeesLogo from "@/assets/moneybees-logo.png";
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
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
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

  // Sync filteredExpenses with allExpenses when no filters are active
  useEffect(() => {
    if (!activeMenuItem || activeMenuItem !== "search") {
      setFilteredExpenses(allExpenses);
    }
  }, [allExpenses, activeMenuItem]);

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
    setFilteredExpenses(prev => [newExpense, ...prev]);
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
    setEditingExpense(expense);
    setIsDetailOpen(false);
  };

  const handleUpdateExpense = (updatedExpense: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    const updated: Expense = {
      ...updatedExpense,
      id: editingExpense.id
    };
    
    setAllExpenses(prev => prev.map(e => e.id === editingExpense.id ? updated : e));
    setFilteredExpenses(prev => prev.map(e => e.id === editingExpense.id ? updated : e));
    setEditingExpense(null);
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
    setActiveTab("more");
    setActiveMenuItem("search");
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
      {/* Header with Hamburger Menu */}
      <div className="bg-gradient-to-r from-card via-muted/30 to-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between min-h-[44px]">
            <HamburgerMenu onMenuItemClick={setActiveMenuItem} />
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-bee-gold to-accent p-1.5 rounded-lg shadow-md">
                <img 
                  src={moneyBeesLogo} 
                  alt="MoneyBee" 
                  className="w-5 h-5 object-contain hover:scale-105 transition-transform duration-200" 
                />
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-bee-blue to-primary bg-clip-text text-transparent">
                MoneyBee Tracker
              </h1>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {allExpenses.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20">
        {/* Home Tab Content */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <ExpenseOverview 
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />
            
            <CategoryBreakdown 
              expenses={filteredExpenses}
            />
            
            {filteredExpenses.length > 0 && (
              <ExpenseList
                expenses={filteredExpenses.slice(0, 10)} // Show only recent 10
                onExpenseClick={handleExpenseClick}
              />
            )}
          </div>
        )}

        {/* Stats Tab Content */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <AdvancedAnalytics 
              expenses={filteredExpenses}
            />
            <CategoryBreakdown 
              expenses={filteredExpenses}
            />
          </div>
        )}

        {/* Budget Tab Content */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <BudgetManager 
              budgets={budgets}
              expenses={filteredExpenses}
              onAddBudget={handleAddBudget}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </div>
        )}

        {/* More Tab Content */}
        {activeTab === "more" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-2">More Options</h2>
              <p className="text-muted-foreground text-sm">
                Access advanced features through the menu button in the top left
              </p>
            </div>
          </div>
        )}

        {/* Menu Item Content */}
        {activeMenuItem === "search" && (
          <div className="space-y-6">
            <SearchAndFilter 
              expenses={allExpenses}
              onFilteredResults={handleFilteredResults}
              onExport={handleExport}
            />
          </div>
        )}

        {activeMenuItem === "calendar" && (
          <div className="space-y-6">
            <CalendarView 
              expenses={filteredExpenses}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {activeMenuItem === "accounts" && (
          <div className="space-y-6">
            <AccountManager 
              accounts={accounts}
              expenses={filteredExpenses}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </div>
        )}

        {activeMenuItem === "recurring" && (
          <div className="space-y-6">
            <RecurringTransactionManager 
              accounts={accounts}
              onGenerateExpenses={(expenses) => {
                expenses.forEach(expense => handleAddExpense(expense));
              }}
            />
          </div>
        )}

        {activeMenuItem === "export" && (
          <div className="space-y-6 text-center py-8">
            <h2 className="text-lg font-semibold mb-4">Export Data</h2>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <TrendingUp size={16} />
              Export All Data
            </Button>
          </div>
        )}
      </div>

        {/* Transaction Detail Modal */}
        <TransactionDetail 
          expense={selectedExpense}
          account={accounts.find(acc => acc.id === selectedExpense?.accountId)}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onDelete={handleDeleteExpense}
          onEdit={handleEditExpense}
        />

        {/* Add Expense Sheet */}
        <Sheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <SheetContent side="bottom" className="h-[95vh] sm:h-[90vh] rounded-t-xl p-0">
            <EnhancedQuickAddExpense 
              onAddExpense={(expense) => {
                handleAddExpense(expense);
                setIsAddExpenseOpen(false);
                toast({
                  title: "✅ Transaction Added",
                  description: `${expense.type === 'income' ? 'Income' : 'Expense'} of $${expense.amount} recorded`,
                  duration: 3000
                });
              }}
              existingExpenses={allExpenses}
              accounts={accounts}
            />
          </SheetContent>
        </Sheet>

        {/* Edit Expense Sheet */}
        <Sheet open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <SheetContent side="bottom" className="h-[95vh] sm:h-[90vh] rounded-t-xl p-0">
            {editingExpense && (
              <EnhancedQuickAddExpense 
                onAddExpense={(expense) => {
                  handleUpdateExpense(expense);
                  toast({
                    title: "✅ Transaction Updated",
                    description: `${expense.type === 'income' ? 'Income' : 'Expense'} of $${expense.amount} updated`,
                    duration: 3000
                  });
                }}
                existingExpenses={allExpenses}
                accounts={accounts}
                editingExpense={editingExpense}
              />
            )}
          </SheetContent>
        </Sheet>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveMenuItem(null); // Clear menu item when switching tabs
        }}
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />
    </div>
  );
};

export default Index;
