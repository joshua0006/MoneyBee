import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { mobileService } from "@/utils/mobileService";
import { AppLockGate } from "@/components/security/AppLockGate";
import { HelmetProvider } from "react-helmet-async";

import Index from "./pages/Index";
import ClerkAuth from "./pages/ClerkAuth";
import NotFound from "./pages/NotFound";
import MobileToolkit from "./pages/MobileToolkit";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import Scanner from "./pages/Scanner";
import Calendar from "./pages/Calendar";
import Accounts from "./pages/Accounts";
import Recurring from "./pages/Recurring";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import Security from "./pages/Security";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  // Update native status bar on theme changes (mobile)
  const { theme } = useTheme();
  useEffect(() => {
    const isDark = theme === 'dark';
    mobileService.setStatusBarColor(isDark ? '#0b0f1a' : '#ffffff', !isDark);
  }, [theme]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <Routes>
              <Route 
                path="/" 
                element={isSignedIn ? <Index /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/auth" 
                element={!isSignedIn ? <ClerkAuth /> : <Navigate to="/" replace />} 
              />
              
              {/* Protected Routes - Only accessible when signed in */}
              <Route path="/transactions" element={isSignedIn ? <Transactions /> : <Navigate to="/auth" replace />} />
              <Route path="/budgets" element={isSignedIn ? <Budgets /> : <Navigate to="/auth" replace />} />
              <Route path="/analytics" element={isSignedIn ? <Analytics /> : <Navigate to="/auth" replace />} />
              <Route path="/goals" element={isSignedIn ? <Goals /> : <Navigate to="/auth" replace />} />
              <Route path="/scanner" element={isSignedIn ? <Scanner /> : <Navigate to="/auth" replace />} />
              <Route path="/calendar" element={isSignedIn ? <Calendar /> : <Navigate to="/auth" replace />} />
              <Route path="/accounts" element={isSignedIn ? <Accounts /> : <Navigate to="/auth" replace />} />
              <Route path="/recurring" element={isSignedIn ? <Recurring /> : <Navigate to="/auth" replace />} />
              <Route path="/reports" element={isSignedIn ? <Reports /> : <Navigate to="/auth" replace />} />
              <Route path="/notifications" element={isSignedIn ? <Notifications /> : <Navigate to="/auth" replace />} />
              <Route path="/settings" element={isSignedIn ? <SettingsPage /> : <Navigate to="/auth" replace />} />
              <Route path="/security" element={isSignedIn ? <Security /> : <Navigate to="/auth" replace />} />
              <Route path="/help" element={isSignedIn ? <Help /> : <Navigate to="/auth" replace />} />
              
              {/* Public Routes */}
              <Route path="/mobile" element={<MobileToolkit />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;