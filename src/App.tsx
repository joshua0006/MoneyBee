import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { mobileService } from "@/utils/mobileService";
import { AppLockGate } from "@/components/security/AppLockGate";

import Index from "./pages/Index";
import ClerkAuth from "./pages/ClerkAuth";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import MobileToolkit from "./pages/MobileToolkit";
import { HelmetProvider } from "react-helmet-async";

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
          <AppLockGate onUnlocked={() => {}} />
          <BrowserRouter>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route 
                path="/" 
                element={isSignedIn ? <Index /> : <Navigate to="/landing" replace />} 
              />
              <Route 
                path="/auth" 
                element={!isSignedIn ? <ClerkAuth /> : <Navigate to="/" replace />} 
              />
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