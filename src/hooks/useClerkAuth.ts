import { useAuth, useUser } from '@clerk/clerk-react';

export function useClerkAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return {
    user,
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
  };
}