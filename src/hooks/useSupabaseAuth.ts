import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    const setSupabaseToken = async () => {
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });
        }
      } catch (error) {
        console.error('Error setting Supabase token:', error);
      }
    };

    setSupabaseToken();
  }, [getToken]);
}