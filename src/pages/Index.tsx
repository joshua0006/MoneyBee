import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ExpenseList } from "@/components/ExpenseList";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { TransactionDetail } from "@/components/TransactionDetail";
import { CalendarView } from "@/components/CalendarView";
import { BudgetManager } from "@/components/BudgetManager";
import { AccountManager } from "@/components/AccountManager";
import { RecurringTransactionManager } from "@/components/RecurringTransactionManager";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import { TrendingUp, BarChart3, Search, PieChart, Calendar, Target, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { EmptyState } from "@/components/EmptyState";
import { OnboardingTooltip, useOnboarding } from "@/components/OnboardingTooltip";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ProgressiveLoader } from "@/components/ProgressiveLoader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { MobileSettings } from "@/components/MobileSettings";
import { Settings } from "@/components/Settings";
import { AppPreferences } from "@/components/AppPreferences";
import { CreditCardManager } from "@/components/CreditCardManager";
import { useCreditCards } from "@/hooks/useCreditCards";
import { useAppData } from "@/contexts/AppDataContext";

// Refactored components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { FinancialOverviewSection } from "@/components/dashboard/FinancialOverviewSection";
import { DashboardLoadingSkeleton } from "@/components/dashboard/DashboardLoadingSkeleton";

// Custom hooks
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

// Utilities
import { getMockGoals, getOnboardingSteps } from "@/utils/dashboardHelpers";

import type { Expense, Account, Budget } from "@/types/app";

const Index = () => {
  const { user, signOut } = useSupabaseAuth();
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
  
  const { creditCards } = useCreditCards();
  
  // State management
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  
  const { shouldShowOnboarding, markAsComplete } = useOnboarding();

  // Custom hooks for data and handlers
  const { monthlyExpenses, totalIncome, totalExpenses } = useDashboardData({
    allExpenses,
    selectedMonth
  });

  const handlers = useDashboardHandlers({
    saveExpense,
    updateExpenseData,
    removeExpense,
    saveAccount,
    updateAccountData,
    removeAccount,
    saveBudget,
    updateBudgetData,
    removeBudget,
    refreshData,
    filteredExpenses,
    setSelectedExpense,
    setIsDetailOpen,
    setEditingExpense,
    setIsAddExpenseOpen,
    setActiveMenuItem
  });

  // Constants from utilities
  const goals = getMockGoals();
  const onboardingSteps = getOnboardingSteps();

  // Sync filteredExpenses with allExpenses when no filters are active
  useEffect(() => {
    if (!activeMenuItem || activeMenuItem !== "search") {
      setFilteredExpenses(allExpenses);
    }
  }, [allExpenses, activeMenuItem]);

  const handleFilteredResults = (filtered: Expense[]) => {
    setFilteredExpenses(filtered);
  };

  // Calculate monthly budget
  const monthlyBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  // User name for welcome banner
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Saver';

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <Helmet>
        <title>MoneyBee Dashboard — Track Expenses & Budgets</title>
        <meta name="description" content="View insights, manage budgets, and track expenses with MoneyBee's AI-powered dashboard." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/` : '/'} />
      </Helmet>
      
      <DashboardHeader 
        expenseCount={allExpenses.length}
        onSignOut={signOut}
      />

      <PullToRefresh onRefresh={handlers.handleRefresh}>
        <main className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 pb-20 xs:pb-24 mobile-nav-spacing scroll-smooth high-dpi-optimize">
          
          <WelcomeBanner userName={userName} />
          
          {/* Main Dashboard Content */}
          <div className="space-y-4">
            <FinancialOverviewSection
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              monthlyBudget={monthlyBudget}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              isLoading={isLoading}
              monthlyExpenses={monthlyExpenses}
            />
            
            {/* Recent Transactions */}
            <div>
              {monthlyExpenses.length > 0 ? (
                <ProgressiveLoader isLoading={isLoading} type="list" delay={200}>
                  <div className="bg-card/40 backdrop-blur-sm rounded-xl xs:rounded-2xl border border-border/20 shadow-soft p-1">
                    <ExpenseList
                      expenses={monthlyExpenses.slice(0, 4)}
                      onExpenseClick={handlers.handleExpenseClick}
                      onEditExpense={handlers.handleEditExpense}
                      onDeleteExpense={handlers.handleDeleteExpense}
                      showViewAll={monthlyExpenses.length > 4}
                      onViewAll={handlers.handleViewAllTransactions}
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

          </div>
        </main>
      </PullToRefresh>

      {/* Modals and Sheets */}
      
      {/* Transaction Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Transaction Details</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedExpense && (
              <TransactionDetail
                expense={selectedExpense}
                account={accounts.find(a => a.id === selectedExpense.accountId)}
                isOpen={isDetailOpen}
                onEdit={() => handlers.handleEditExpense(selectedExpense)}
                onDelete={() => handlers.handleDeleteExpense(selectedExpense.id)}
                onClose={() => setIsDetailOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Search and Filter Sheet */}
      <Sheet
        open={activeMenuItem === "search"}
        onOpenChange={(open) => !open && setActiveMenuItem(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[calc(100vh-env(safe-area-inset-top))] max-h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[90vh] p-0 flex flex-col"
        >
          <SheetHeader className="flex-shrink-0 p-4 border-b">
            <SheetTitle>Search & Filter Transactions</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4">
              <SearchAndFilter
                expenses={allExpenses}
                onFilteredResults={handleFilteredResults}
                onExport={handlers.handleExport}
              />
            </div>
            {/* Scrollable transactions list */}
            <div className="flex-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <ExpenseList
                expenses={filteredExpenses}
                onExpenseClick={handlers.handleExpenseClick}
                onEditExpense={handlers.handleEditExpense}
                onDeleteExpense={handlers.handleDeleteExpense}
                showViewAll={false}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Calendar View Sheet */}
      <Sheet
        open={activeMenuItem === "calendar"}
        onOpenChange={(open) => !open && setActiveMenuItem(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[calc(100vh-env(safe-area-inset-top))] max-h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[90vh] p-0 flex flex-col"
        >
          <SheetHeader className="flex-shrink-0 p-4 border-b">
            <SheetTitle>Calendar View</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <CalendarView
              expenses={allExpenses}
              budgets={budgets}
              accounts={accounts}
              goals={goals}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Budget Manager Sheet */}
      <Sheet
        open={activeMenuItem === "budgets"}
        onOpenChange={(open) => !open && setActiveMenuItem(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[calc(100vh-env(safe-area-inset-top))] max-h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[90vh] p-0 flex flex-col"
        >
          <SheetHeader className="flex-shrink-0 p-4 border-b">
            <SheetTitle>Budget Manager</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <BudgetManager
              budgets={budgets}
              expenses={allExpenses}
              onAddBudget={handlers.handleAddBudget}
              onUpdateBudget={handlers.handleUpdateBudget}
              onDeleteBudget={handlers.handleDeleteBudget}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Recurring Transactions Sheet */}
      <Sheet
        open={activeMenuItem === "recurring"}
        onOpenChange={(open) => !open && setActiveMenuItem(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[calc(100vh-env(safe-area-inset-top))] max-h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[90vh] p-0 flex flex-col"
        >
          <SheetHeader className="flex-shrink-0 p-4 border-b">
            <SheetTitle>Recurring Transactions</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <RecurringTransactionManager
              accounts={accounts}
              onGenerateExpenses={(expenses) => {
                expenses.forEach(expense => handlers.handleAddExpense(expense));
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Expense Sheet */}
      <Sheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <SheetContent side="bottom" className="h-[95vh] sm:h-[90vh] rounded-t-xl p-0">
          <EnhancedQuickAddExpense
            onAddExpense={handlers.handleAddExpense}
            existingExpenses={allExpenses}
            accounts={accounts}
          />
        </SheetContent>
      </Sheet>

      {/* Onboarding Tooltips */}
      {shouldShowOnboarding && (
        <OnboardingTooltip
          steps={onboardingSteps}
          isVisible={shouldShowOnboarding}
          onComplete={() => markAsComplete()}
          onSkip={() => markAsComplete()}
        />
      )}
    </div>
  );
};

export default Index;