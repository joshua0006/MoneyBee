import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { ExpenseOverview } from "@/components/ExpenseOverview";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import moneyBeesLogo from "@/assets/moneybees-logo.png";
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
import { TrendingUp, BarChart3, Search, PieChart, Calendar, Target, Settings, Clock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { OnboardingTooltip, useOnboarding } from "@/components/OnboardingTooltip";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ProgressiveLoader } from "@/components/ProgressiveLoader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { MobileSettings } from "@/components/MobileSettings";
import { mobileService } from "@/utils/mobileService";
import { 
  exportExpensesAsCSV,
  type Expense,
  type Account,
  type Budget
} from "@/utils/expenseUtils";

const Index = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
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
  const { shouldShowOnboarding, markAsComplete } = useOnboarding();

  // Onboarding steps
  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to MoneyBee! 🐝',
      description: 'Your smart expense tracking companion. Let\'s get you started with the basics.',
    },
    {
      id: 'add-expense',
      title: 'Add Your First Expense',
      description: 'Tap the golden bee button to add expenses quickly. You can type naturally or scan receipts!',
    },
    {
      id: 'features',
      title: 'Explore Features',
      description: 'Use the menu (☰) to access budgets, analytics, and more. The bottom tabs switch between different views.',
    },
    {
      id: 'ready',
      title: 'You\'re All Set! ✨',
      description: 'Start tracking your expenses and watch your financial insights grow.',
    }
  ];

  // Get current user and load data
  useEffect(() => {
    if (user) {
      try {
        const loadedExpenses = JSON.parse(localStorage.getItem(`${user.id}_expense_tracker_data`) || '[]');
        const loadedAccounts = JSON.parse(localStorage.getItem(`${user.id}_expense_tracker_accounts`) || '[]');
        const loadedBudgets = JSON.parse(localStorage.getItem(`${user.id}_expense_tracker_budgets`) || '[]');
        
        setAllExpenses(loadedExpenses.map((e: any) => ({ ...e, date: new Date(e.date) })));
        setFilteredExpenses(loadedExpenses.map((e: any) => ({ ...e, date: new Date(e.date) })));
        setAccounts(loadedAccounts);
        setBudgets(loadedBudgets.map((b: any) => ({ ...b, startDate: new Date(b.startDate) })));
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
      setIsLoading(false);
    }
  }, [user]);

  // Sync filteredExpenses with allExpenses when no filters are active
  useEffect(() => {
    if (!activeMenuItem || activeMenuItem !== "search") {
      setFilteredExpenses(allExpenses);
    }
  }, [allExpenses, activeMenuItem]);

  // Save data whenever data changes
  useEffect(() => {
    if (!isLoading && user) {
      const serializedExpenses = allExpenses.map(expense => ({
        ...expense,
        date: expense.date.toISOString()
      }));
      localStorage.setItem(`${user.id}_expense_tracker_data`, JSON.stringify(serializedExpenses));
    }
  }, [allExpenses, isLoading, user]);

  useEffect(() => {
    if (!isLoading && user) {
      localStorage.setItem(`${user.id}_expense_tracker_accounts`, JSON.stringify(accounts));
    }
  }, [accounts, isLoading, user]);

  useEffect(() => {
    if (!isLoading && user) {
      const serializedBudgets = budgets.map(budget => ({
        ...budget,
        startDate: budget.startDate.toISOString()
      }));
      localStorage.setItem(`${user.id}_expense_tracker_budgets`, JSON.stringify(serializedBudgets));
    }
  }, [budgets, isLoading, user]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setAllExpenses(prev => [newExpense, ...prev]);
    setFilteredExpenses(prev => [newExpense, ...prev]);
    
    // Mobile feedback
    mobileService.successHaptic();
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
    mobileService.errorHaptic();
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
    mobileService.lightHaptic();
    setActiveTab("more");
    setActiveMenuItem("search");
  };

  const totalIncome = allExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = allExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you'd fetch fresh data here
    // For now, just show a success message
    toast({
      title: "Data refreshed",
      description: "Your expenses are up to date",
      duration: 2000
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-card via-muted/30 to-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between min-h-[44px]">
              <LoadingSkeleton type="card" count={1} />
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 space-y-6">
          <LoadingSkeleton type="overview" />
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="list" count={5} />
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {allExpenses.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => signOut()}
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20">
        {/* Home Tab Content */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <ProgressiveLoader isLoading={isLoading} type="overview">
              <ExpenseOverview 
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
              />
            </ProgressiveLoader>
            
            <ProgressiveLoader isLoading={isLoading} type="chart" delay={100}>
              <CategoryBreakdown 
                expenses={filteredExpenses}
              />
            </ProgressiveLoader>
            
            {filteredExpenses.length > 0 ? (
              <ProgressiveLoader isLoading={isLoading} type="list" delay={200}>
                <ExpenseList
                  expenses={filteredExpenses.slice(0, 10)} // Show only recent 10
                  onExpenseClick={handleExpenseClick}
                  onDeleteExpense={handleDeleteExpense}
                  showViewAll={filteredExpenses.length > 10}
                  onViewAll={handleViewAllTransactions}
                />
              </ProgressiveLoader>
            ) : !isLoading && (
              <EmptyState 
                type="expenses"
                onAction={() => setIsAddExpenseOpen(true)}
              />
            )}
          </div>
        )}

        {/* Stats Tab Content */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {filteredExpenses.length > 0 ? (
              <>
                <AdvancedAnalytics 
                  expenses={filteredExpenses}
                />
                <CategoryBreakdown 
                  expenses={filteredExpenses}
                />
              </>
            ) : (
              <EmptyState 
                type="analytics"
                onAction={() => setIsAddExpenseOpen(true)}
              />
            )}
          </div>
        )}

        {/* Budget Tab Content */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            {budgets.length > 0 || filteredExpenses.length > 0 ? (
              <BudgetManager 
                budgets={budgets}
                expenses={filteredExpenses}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onDeleteBudget={handleDeleteBudget}
              />
            ) : (
              <EmptyState 
                type="budget"
                description="Set spending limits for different categories to stay on track with your financial goals"
                onAction={() => {
                  // Show the budget tab which will have the add budget functionality
                  setActiveTab("budget");
                }}
              />
            )}
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

        {/* Mobile Settings */}
        {activeMenuItem === "settings" && (
          <div className="space-y-6">
            <MobileSettings />
          </div>
        )}
        </div>
      </PullToRefresh>

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

      {/* Floating Action Button */}
      <FloatingActionButton 
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Onboarding */}
      <OnboardingTooltip 
        steps={onboardingSteps}
        isVisible={shouldShowOnboarding}
        onComplete={markAsComplete}
        onSkip={markAsComplete}
      />

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
