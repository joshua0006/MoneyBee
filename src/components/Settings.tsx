import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { 
  User, 
  Download, 
  Upload, 
  Trash2, 
  Shield, 
  LogOut,
  Mail,
  RotateCcw,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const { user, signOut } = useSupabaseAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleClearData = () => {
    toast({
      title: "Clear data",
      description: "This feature is coming soon.",
    });
  };

  const handleResetIntro = () => {
    localStorage.removeItem('intro_seen');
    toast({
      title: "Welcome intro reset",
      description: "You'll see the intro screens again next time you visit.",
    });
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_data');
    toast({
      title: "Setup flow reset",
      description: "You'll go through the setup process again next time you sign in.",
    });
  };

  const handleResetQuickTour = () => {
    localStorage.removeItem('hasSeenOnboarding');
    toast({
      title: "Quick tour reset",
      description: "You'll see the feature tooltips again in the main app.",
    });
  };

  const handleResetAllOnboarding = () => {
    localStorage.removeItem('intro_seen');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_data');
    localStorage.removeItem('hasSeenOnboarding');
    toast({
      title: "All onboarding reset",
      description: "All tutorial experiences have been reset.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Primary email</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                Verified
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Full Name</p>
                <p className="text-sm text-muted-foreground">
                  {user?.user_metadata?.full_name || "Not set"}
                </p>
              </div>
            </div>
        </CardContent>
      </Card>


      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            disabled
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
            <Badge variant="secondary" className="ml-auto">
              Coming Soon
            </Badge>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleClearData}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Onboarding & Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Onboarding & Help
          </CardTitle>
          <CardDescription>
            Reset tutorial experiences to see them again
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleResetIntro}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Welcome Intro
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleResetOnboarding}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Setup Flow
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleResetQuickTour}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Quick Tour
          </Button>
          
          <Separator />
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleResetAllOnboarding}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Onboarding
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};