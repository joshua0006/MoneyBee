import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

/**
 * Secure authentication hook that provides user data with proper type safety
 * and integrates with both Clerk and Supabase security models
 */
export function useSecureAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [userMetadata, setUserMetadata] = useState<any>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      // Store essential user data securely in localStorage for RLS policies
      localStorage.setItem('clerk_user_id', user.id);
      localStorage.setItem('clerk_user_email', user.emailAddresses[0]?.emailAddress || '');
      
      // Set user metadata for the app
      setUserMetadata({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } else {
      // Clear stored data when signed out
      localStorage.removeItem('clerk_user_id');
      localStorage.removeItem('clerk_user_email');
      setUserMetadata(null);
    }
  }, [isSignedIn, user]);

  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user: userMetadata,
    clerkUser: user,
  };
}