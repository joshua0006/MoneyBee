import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import Index from "./pages/Index";
import ClerkAuth from "./pages/ClerkAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();
  
  // Set up Supabase authentication with Clerk token
  useSupabaseAuth();

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;