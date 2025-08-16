import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Smartphone, 
  Vibrate, 
  Eye, 
  Palette, 
  Download, 
  Bell, 
  Lock,
  Wifi,
  Battery,
  Settings as SettingsIcon
} from 'lucide-react';
import { mobileService } from '@/utils/mobileService';
import { useToast } from '@/hooks/use-toast';
import { registerForPush } from '@/utils/pushNotifications';
import { supabase } from '@/integrations/supabase/client';

interface MobileSettingsProps {
  onClose?: () => void;
}

interface Settings {
  hapticFeedback: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
  offlineMode: boolean;
  autoBackup: boolean;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  quickAmountButtons: number[];
  defaultCategory: string;
  soundEffects: boolean;
}

export const MobileSettings: React.FC<MobileSettingsProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    hapticFeedback: true,
    pushNotifications: true,
    biometricAuth: false,
    offlineMode: true,
    autoBackup: false,
    theme: 'auto',
    currency: 'SGD', // Default to SGD for Singapore users
    quickAmountButtons: [5, 10, 20, 50],
    defaultCategory: 'Other',
    soundEffects: true
  });

  const [platformInfo, setPlatformInfo] = useState({
    platform: mobileService.platform,
    isMobile: mobileService.isMobile
  });
  const [isSendingPush, setIsSendingPush] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('mobileSettings');
    if (savedSettings) {
      try {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('mobileSettings', JSON.stringify(updatedSettings));
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
      duration: 2000
    });
  };

  const testHaptic = async () => {
    await mobileService.mediumHaptic();
    toast({
      title: "Haptic test",
      description: "Did you feel the vibration?",
      duration: 2000
    });
  };

  const installPWA = () => {
    // Check if PWA installation is available
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          toast({
            title: "App installed!",
            description: "MoneyBee is now available on your home screen",
            duration: 3000
          });
        }
      });
    } else {
      toast({
        title: "Install available",
        description: "Use your browser's 'Add to Home Screen' option",
        duration: 3000
      });
    }
  };
  
  const sendTestPush = async () => {
    try {
      setIsSendingPush(true);
      const res = await registerForPush();
      if (!res.granted || !res.token) {
        toast({
          title: 'Cannot send push',
          description: res.reason || 'No device token available.',
        });
        return;
      }
      const { error } = await supabase.functions.invoke('push-send', {
        body: {
          token: res.token,
          title: 'Test notification',
          body: 'Hello from MoneyBee!',
          data: { source: 'mobile-settings' },
        },
      });
      if (error) throw error;
      toast({ title: 'Push sent', description: 'Check your device.' });
    } catch (e: any) {
      toast({ title: 'Failed to send', description: e?.message || 'Unknown error' });
    } finally {
      setIsSendingPush(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon size={20} />
            Mobile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="interface">Interface</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* Platform Info */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Smartphone size={16} />
                  Device Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Platform</Label>
                    <Badge variant="outline">{platformInfo.platform}</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Environment</Label>
                    <Badge variant="outline">{platformInfo.isMobile ? 'Mobile' : 'Desktop'}</Badge>
                  </div>
                </div>
              </div>

              {/* Haptic Feedback */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate size={16} />
                    <Label>Haptic Feedback</Label>
                  </div>
                  <Switch
                    checked={settings.hapticFeedback}
                    onCheckedChange={(checked) => saveSettings({ hapticFeedback: checked })}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testHaptic}
                  disabled={!settings.hapticFeedback}
                >
                  Test Vibration
                </Button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <Label>Push Notifications</Label>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={async (checked) => {
                    saveSettings({ pushNotifications: checked });
                    if (checked) {
                      const res = await registerForPush();
                      toast({
                        title: res.granted ? 'Push enabled' : 'Push not enabled',
                        description: res.granted ? 'You will receive notifications.' : (res.reason || 'Permission denied'),
                      });
                    } else {
                      toast({ title: 'Push disabled', description: 'You will not receive notifications.' });
                    }
                  }}
                />
              </div>

              <div className="mt-2">
                <Button size="sm" onClick={sendTestPush} disabled={isSendingPush}>
                  {isSendingPush ? 'Sending...' : 'Send test notification'}
                </Button>
              </div>

              {/* Biometric Auth */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <Label>Biometric Authentication</Label>
                </div>
                <Switch
                  checked={settings.biometricAuth}
                  onCheckedChange={(checked) => saveSettings({ biometricAuth: checked })}
                />
              </div>

              {/* PWA Installation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download size={16} />
                  <Label>Install App</Label>
                </div>
                <Button onClick={installPWA} className="w-full">
                  Add to Home Screen
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="interface" className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} />
                  <Label>Theme</Label>
                </div>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value: 'light' | 'dark' | 'auto') => {
                    saveSettings({ theme: value });
                    // Apply theme immediately
                    if (value === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (value === 'light') {
                      document.documentElement.classList.remove('dark');
                    } else {
                      // Auto theme - check system preference
                      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      if (prefersDark) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light 🌞</SelectItem>
                    <SelectItem value="dark">Dark 🌙</SelectItem>
                    <SelectItem value="auto">Auto ⚡</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Currency */}
              <div className="space-y-3">
                <Label>Currency</Label>
                <Select 
                  value={settings.currency} 
                  onValueChange={(value) => saveSettings({ currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SGD">SGD (S$)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="MYR">MYR (RM)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <Label>Sound Effects</Label>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => saveSettings({ soundEffects: checked })}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-3">
                <Label>Quick Amount Buttons</Label>
                <div className="grid grid-cols-4 gap-2">
                  {settings.quickAmountButtons.map((amount, index) => (
                    <Input
                      key={index}
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        const newAmounts = [...settings.quickAmountButtons];
                        newAmounts[index] = Number(e.target.value);
                        saveSettings({ quickAmountButtons: newAmounts });
                      }}
                      className="text-center"
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              {/* Offline Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi size={16} />
                  <Label>Offline Mode</Label>
                </div>
                <Switch
                  checked={settings.offlineMode}
                  onCheckedChange={(checked) => saveSettings({ offlineMode: checked })}
                />
              </div>

              {/* Auto Backup */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery size={16} />
                  <Label>Auto Backup</Label>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => saveSettings({ autoBackup: checked })}
                />
              </div>

              {/* Storage Info */}
              <div className="space-y-3">
                <Label>Storage Usage</Label>
                <div className="text-sm text-muted-foreground">
                  Local storage usage: ~{Math.round(JSON.stringify(localStorage).length / 1024)}KB
                </div>
              </div>

              {/* Data Actions */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full">
                  Import Data
                </Button>
                <Button variant="destructive" className="w-full">
                  Clear All Data
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};