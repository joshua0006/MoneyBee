import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { 
  Bell, 
  Palette, 
  Moon,
  Sun
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AppPreferences = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString());
  }, [notifications]);

  const handleNotificationChange = async (checked: boolean) => {
    setNotifications(checked);
    
    if (checked && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Notifications enabled",
            description: "You'll receive push notifications for important updates.",
          });
        } else {
          toast({
            title: "Notification permission denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Notification setup failed",
          description: "Unable to set up notifications.",
          variant: "destructive",
        });
      }
    } else if (!checked) {
      toast({
        title: "Notifications disabled",
        description: "You won't receive push notifications.",
      });
    }
  };

  const handleDarkModeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast({
      title: `${checked ? 'Dark' : 'Light'} mode enabled`,
      description: `Switched to ${checked ? 'dark' : 'light'} theme.`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            App Preferences
          </CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={handleNotificationChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={handleDarkModeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};