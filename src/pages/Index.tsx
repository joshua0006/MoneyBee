import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ExpenseOverview } from "@/components/ExpenseOverview";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import moneyBeesLogo from "@/assets/moneybees-logo.png";
import { ExpenseList } from "@/components/ExpenseList";
const CategoryBreakdown = lazy(() => import("@/components/CategoryBreakdown").then(m => ({ default: m.CategoryBreakdown })));
import { SearchAndFilter } from "@/components/SearchAndFilter";
const AdvancedAnalytics = lazy(() => import("@/components/AdvancedAnalytics").then(m => ({ default: m.AdvancedAnalytics })));
import { TransactionDetail } from "@/components/TransactionDetail";
import { CalendarView } from "@/components/CalendarView";
import { BudgetManager } from "@/components/BudgetManager";
import { AccountManager } from "@/components/AccountManager";
import { RecurringTransactionManager } from "@/components/RecurringTransactionManager";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, BarChart3, Search, PieChart, Calendar, Target, Clock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { OnboardingTooltip, useOnboarding } from "@/components/OnboardingTooltip";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ProgressiveLoader } from "@/components/ProgressiveLoader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { MobileSettings } from "@/components/MobileSettings";
import { Settings } from "@/components/Settings";
import { AppPreferences } from "@/components/AppPreferences";
const FinancialSimulation = lazy(() => import("@/components/FinancialSimulation").then(m => ({ default: m.FinancialSimulation })));
const GamificationHub = lazy(() => import("@/components/gamification/GamificationHub").then(m => ({ default: m.GamificationHub })));
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/hooks/useAppData";
import type { Expense, Account, Budget } from "@/types/app";

const Index = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const {
    expenses: allExpenses,
    accounts,
    budgets,
    isLoading,
    addExpense: saveExpense,
    updateExpense: updateExpenseData,
    deleteExpense: removeExpense,
    addAccount: saveAccount,
    updateAccount: updateAccountData,
    deleteAccount: removeAccount,
    addBudget: saveBudget,
    updateBudget: updateBudgetData,
    deleteBudget: removeBudget,
    refreshData
  } = useAppData();
  
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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

  // Filter expenses by selected month
  const monthlyExpenses = allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    return expenseDate >= monthStart && expenseDate <= monthEnd;
  });

  // Sync filteredExpenses with allExpenses when no filters are active
  useEffect(() => {
    if (!activeMenuItem || activeMenuItem !== "search") {
      setFilteredExpenses(allExpenses);
    }
  }, [allExpenses, activeMenuItem]);

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    await saveExpense(expense);
    mobileService.successHaptic();
  };

  const handleAddAccount = async (account: Omit<Account, 'id'>) => {
    await saveAccount(account);
    mobileService.successHaptic();
  };

  const handleUpdateAccount = async (updatedAccount: Account) => {
    await updateAccountData(updatedAccount.id, updatedAccount);
    mobileService.lightHaptic();
  };

  const handleDeleteAccount = async (id: string) => {
    await removeAccount(id);
    mobileService.errorHaptic();
  };

  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    await saveBudget(budget);
    mobileService.successHaptic();
  };

  const handleUpdateBudget = async (updatedBudget: Budget) => {
    await updateBudgetData(updatedBudget.id, updatedBudget);
    mobileService.lightHaptic();
  };

  const handleDeleteBudget = async (id: string) => {
    await removeBudget(id);
    mobileService.errorHaptic();
  };

  const handleFilteredResults = (filtered: Expense[]) => {
    setFilteredExpenses(filtered);
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    await removeExpense(id);
    mobileService.errorHaptic();
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDetailOpen(false);
    setIsAddExpenseOpen(false);
  };

  const handleUpdateExpense = async (updatedExpense: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    await updateExpenseData(editingExpense.id, updatedExpense);
    setEditingExpense(null);
  };

  const handleExport = () => {
    try {
      // Simple CSV export functionality
      const csvContent = [
        ['Date', 'Description', 'Category', 'Amount', 'Type'],
        ...filteredExpenses.map(expense => [
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

  const totalIncome = monthlyExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = monthlyExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    mobileService.lightHaptic();
    await refreshData();
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
      <Helmet>
        <title>MoneyBee Dashboard — Track Expenses & Budgets</title>
        <meta name="description" content="View insights, manage budgets, and track expenses with MoneyBee's AI-powered dashboard." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/` : '/'} />
      </Helmet>
      {/* Enhanced Branded Header */}
      <div className="bg-gradient-to-r from-background via-card/50 to-background border-b border-border/30 sticky top-0 z-40 backdrop-blur-md shadow-soft">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between min-h-[48px]">
            <HamburgerMenu />
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-bee-gold via-bee-amber to-accent p-2 rounded-xl shadow-gold animate-bounce-gentle">
                  <img 
                    src={moneyBeesLogo} 
                    alt="MoneyBee" 
                    className="w-6 h-6 object-contain hover:scale-105 transition-transform duration-200" 
                  />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-bee-gold/20 to-accent/20 rounded-xl blur-sm -z-10"></div>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
                  MoneyBee
                </h1>
                <p className="text-xs text-muted-foreground font-medium -mt-0.5">Smart Finance Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-bee-blue/10 to-primary/10 px-2 py-1 rounded-lg border border-bee-blue/20">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-transparent border-0 text-bee-blue font-medium">
                  {allExpenses.length} entries
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-20 safe-area-inset-bottom">
        
        {/* Welcome Banner */}
        <div className="mb-6 p-6 bg-gradient-to-br from-bee-gold/5 via-background to-bee-blue/5 rounded-2xl border border-bee-gold/20 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Welcome back, {user?.firstName || 'Saver'}! 🐝
              </h2>
              <p className="text-sm text-muted-foreground">
                Let's make your money grow like a busy bee hive
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Today</div>
              <div className="text-sm font-medium text-bee-blue">
                {format(new Date(), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>
        {/* Home Tab Content */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <ProgressiveLoader isLoading={isLoading} type="overview">
              <div className="bg-gradient-to-br from-card via-background to-card/50 rounded-2xl border border-border/50 shadow-medium p-1">
                <ExpenseOverview 
                  totalIncome={totalIncome}
                  totalExpenses={totalExpenses}
                  monthlyBudget={budgets.reduce((sum, budget) => sum + budget.amount, 0)}
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
              </div>
            </ProgressiveLoader>
            
            <ProgressiveLoader isLoading={isLoading} type="chart" delay={100}>
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 shadow-soft p-1">
                <Suspense fallback={null}>
                  <CategoryBreakdown 
                    expenses={monthlyExpenses}
                  />
                </Suspense>
              </div>
            </ProgressiveLoader>
            
            {monthlyExpenses.length > 0 ? (
              <ProgressiveLoader isLoading={isLoading} type="list" delay={200}>
                <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/20 shadow-soft p-1">
                  <ExpenseList
                    expenses={monthlyExpenses.slice(0, 10)} // Show only recent 10
                    onExpenseClick={handleExpenseClick}
                    onEditExpense={handleEditExpense}
                    onDeleteExpense={handleDeleteExpense}
                    showViewAll={monthlyExpenses.length > 10}
                    onViewAll={handleViewAllTransactions}
                  />
                </div>
              </ProgressiveLoader>
            ) : !isLoading && (
              <div className="bg-gradient-to-br from-muted/30 to-card/50 rounded-2xl border-2 border-dashed border-border/40 shadow-soft">
                <EmptyState 
                  type="expenses"
                  onAction={() => setIsAddExpenseOpen(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Stats Tab Content */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {filteredExpenses.length > 0 ? (
              <>
                <Suspense fallback={null}>
                  <AdvancedAnalytics 
                    expenses={filteredExpenses}
                  />
                </Suspense>
                <Suspense fallback={null}>
                  <CategoryBreakdown 
                    expenses={filteredExpenses}
                  />
                </Suspense>
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

        {/* Growth Tab Content */}
        {activeTab === "growth" && (
          <div className="space-y-6">
            <Suspense fallback={null}>
              <FinancialSimulation expenses={filteredExpenses} />
            </Suspense>
          </div>
        )}

        {/* Gamification Tab Content */}
        {activeTab === "gamification" && (
          <div className="space-y-6">
            <Suspense fallback={null}>
              <GamificationHub expenses={filteredExpenses} />
            </Suspense>
          </div>
        )}

        {/* More Tab Content */}
        {activeTab === "more" && (
          <div className="space-y-6">
            {activeMenuItem ? (
              <div className="text-center py-8">
                <h2 className="text-lg font-semibold mb-2">Feature Active</h2>
                <p className="text-muted-foreground text-sm">
                  {activeMenuItem} is currently being displayed
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-lg font-semibold mb-2">More Options</h2>
                <p className="text-muted-foreground text-sm">
                  Access advanced features through the menu button in the top left
                </p>
              </div>
            )}
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

        {/* Settings from Hamburger Menu */}
        {activeMenuItem === "settings" && (
          <div className="space-y-6">
            <AppPreferences />
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
                setActiveTab("home"); // Auto switch to home tab
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
              key={editingExpense.id}
               onAddExpense={(expense) => {
                 handleUpdateExpense(expense);
                 setEditingExpense(null);
                 setActiveTab("home");
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
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />
    </div>
  );
};

export default Index;
