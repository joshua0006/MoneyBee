import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useEffect, useState } from 'react';
import { mobileService } from "@/utils/mobileService";
import { AppLockGate } from "@/components/security/AppLockGate";
import { HelmetProvider } from "react-helmet-async";
import { BottomNavigation } from "@/components/BottomNavigation";
import { EnhancedQuickAddExpense } from "@/components/EnhancedQuickAddExpense";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/hooks/useAppData";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Cover from "./pages/Cover";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import MobileToolkit from "./pages/MobileToolkit";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import Growth from "./pages/Growth";
import Scanner from "./pages/Scanner";
import Calendar from "./pages/Calendar";
import Accounts from "./pages/Accounts";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import Security from "./pages/Security";
import Help from "./pages/Help";
import Investments from "./pages/Investments";

const queryClient = new QueryClient();

// AppContent component to handle authenticated state
const AppContent = () => {
  console.log('AppContent starting');
  const { isAuthenticated } = useSupabaseAuth();
  console.log('Authentication status:', isAuthenticated);
  const location = useLocation();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const { expenses, accounts, addExpense } = useAppData();
  const { toast } = useToast();

  // Check onboarding states
  const hasSeenIntro = localStorage.getItem('intro_seen') === 'true';
  const hasSeenCover = localStorage.getItem('cover_seen') === 'true';
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
  
  console.log('Onboarding status:', { hasSeenIntro, hasSeenCover, hasCompletedOnboarding });

  // Don't show bottom navigation on auth pages, welcome, cover, or onboarding
  const showBottomNav = isAuthenticated && 
    !location.pathname.includes('/auth') && 
    !location.pathname.includes('/welcome') && 
    !location.pathname.includes('/cover') && 
    !location.pathname.includes('/onboarding');

  const handleAddExpense = async (expense: any) => {
    await addExpense(expense);
    mobileService.successHaptic();
    setIsAddExpenseOpen(false);
    toast({
      title: "✅ Transaction Added",
      description: `${expense.type === 'income' ? 'Income' : 'Expense'} of $${expense.amount} recorded`,
      duration: 3000
    });
  };

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            !hasSeenIntro ? (
              <>
                {console.log('Redirecting to welcome')}
                <Navigate to="/welcome" replace />
              </>
            ) : !isAuthenticated ? (
              <>
                {console.log('Redirecting to auth')}
                <Navigate to="/auth" replace />
              </>
            ) : !hasCompletedOnboarding ? (
              <>
                {console.log('Redirecting to onboarding')}
                <Navigate to="/onboarding" replace />
              </>
            ) : !hasSeenCover ? (
              <>
                {console.log('Redirecting to cover')}
                <Navigate to="/cover" replace />
              </>
            ) : (
              <>
                {console.log('Rendering Index page')}
                <Index />
              </>
            )
          } 
        />
        <Route 
          path="/welcome" 
          element={!hasSeenIntro ? <Welcome /> : <Navigate to={isAuthenticated ? "/" : "/auth"} replace />} 
        />
        <Route 
          path="/cover" 
          element={
            isAuthenticated && hasCompletedOnboarding && !hasSeenCover ? 
            <Cover /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            isAuthenticated && !hasCompletedOnboarding ? 
            <Onboarding /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/auth" 
          element={!isAuthenticated ? <Auth /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected Routes - Only accessible when signed in */}
        <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/auth" replace />} />
        <Route path="/budgets" element={isAuthenticated ? <Budgets /> : <Navigate to="/auth" replace />} />
        <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/auth" replace />} />
        <Route path="/goals" element={isAuthenticated ? <Goals /> : <Navigate to="/auth" replace />} />
        <Route path="/growth" element={isAuthenticated ? <Growth /> : <Navigate to="/auth" replace />} />
        <Route path="/scanner" element={isAuthenticated ? <Scanner /> : <Navigate to="/auth" replace />} />
        <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/auth" replace />} />
        <Route path="/accounts" element={isAuthenticated ? <Accounts /> : <Navigate to="/auth" replace />} />
        <Route path="/investments" element={isAuthenticated ? <Investments /> : <Navigate to="/auth" replace />} />
        <Route path="/recurring" element={isAuthenticated ? <Recurring /> : <Navigate to="/auth" replace />} />
        <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/auth" replace />} />
        <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/auth" replace />} />
        <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/auth" replace />} />
        <Route path="/security" element={isAuthenticated ? <Security /> : <Navigate to="/auth" replace />} />
        <Route path="/help" element={isAuthenticated ? <Help /> : <Navigate to="/auth" replace />} />
        
        {/* Public Routes */}
        <Route path="/mobile" element={<MobileToolkit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Bottom Navigation - only show when signed in */}
      {showBottomNav && (
        <BottomNavigation onAddExpense={() => setIsAddExpenseOpen(true)} />
      )}

      {/* Global Add Expense Modal */}
      {isAuthenticated && (
        <Sheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <SheetContent side="bottom" className="h-[95vh] sm:h-[90vh] rounded-t-xl p-0">
            <EnhancedQuickAddExpense 
              onAddExpense={handleAddExpense}
              existingExpenses={expenses || []}
              accounts={accounts || []}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

const App = () => {
  console.log('Main App component starting');
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  console.log('Main App auth status:', { isAuthenticated, isLoading });

  // Update native status bar on theme changes (mobile)
  const { theme } = useTheme();
  useEffect(() => {
    const isDark = theme === 'dark';
    mobileService.setStatusBarColor(isDark ? '#0b0f1a' : '#ffffff', !isDark);
  }, [theme]);

  // Show loading while Supabase Auth is initializing
  if (isLoading) {
    console.log('App showing auth loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('App rendering main content');
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* <AppLockGate onUnlocked={() => {}} /> */}
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;