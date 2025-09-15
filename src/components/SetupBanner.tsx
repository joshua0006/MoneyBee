import { useState, useEffect } from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';

export function SetupBanner() {
  const { user } = useUser();
  const [showBanner, setShowBanner] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<number>(0);

  const checkJWTTemplate = async () => {
    if (!user) return false;
    
    setIsChecking(true);
    try {
      // Try to get a Supabase JWT token
      const session = (window as any)?.Clerk?.session;
      if (!session?.getToken) return false;
      
      const token = await session.getToken({ template: 'supabase' });
      setLastCheck(Date.now());
      return !!token;
    } catch (error) {
      console.log('JWT template check:', error);
      setLastCheck(Date.now());
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const handleRecheck = async () => {
    const hasTemplate = await checkJWTTemplate();
    setShowBanner(!hasTemplate);
  };

  useEffect(() => {
    // Only check if we haven't checked recently (within 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (user && lastCheck < fiveMinutesAgo) {
      checkJWTTemplate().then(hasTemplate => {
        setShowBanner(!hasTemplate);
      });
    }
  }, [user, lastCheck]);

  if (!showBanner) return null;

  return (
    <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>Setup Required:</strong> Clerk JWT template "supabase" not configured. 
          Data saves are failing.{" "}
          <a 
            href="https://clerk.com/docs/integrations/databases/supabase#create-a-jwt-template" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Configure now
          </a>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRecheck}
            disabled={isChecking}
            className="h-8"
          >
            <RotateCcw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            Recheck
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowBanner(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}