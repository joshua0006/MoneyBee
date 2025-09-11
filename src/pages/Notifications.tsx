import { ArrowLeft, Bell, CreditCard, PieChart, TrendingUp, Shield, Smartphone, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { mobileService } from "@/utils/mobileService";
import { registerForPush } from "@/utils/pushNotifications";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { 
  getBillReminderSettings, 
  saveBillReminderSettings, 
  type BillReminderSettings 
} from "@/utils/billReminderService";

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState({
    billReminders: true,
    expenses: true,
    budgets: true,
    insights: false,
    security: true,
    updates: false
  });
  const [billReminderSettings, setBillReminderSettings] = useState<BillReminderSettings>(getBillReminderSettings());

  // Load bill reminder settings on component mount
  useEffect(() => {
    setBillReminderSettings(getBillReminderSettings());
  }, []);

  const updateSetting = (key: string, value: boolean) => {
    mobileService.lightHaptic();
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Special handling for bill reminders
    if (key === 'billReminders') {
      const newSettings = { ...billReminderSettings, enabled: value };
      setBillReminderSettings(newSettings);
      saveBillReminderSettings(newSettings);
    }
  };

  const updateBillReminderSetting = (key: keyof BillReminderSettings, value: any) => {
    mobileService.lightHaptic();
    const newSettings = { ...billReminderSettings, [key]: value };
    setBillReminderSettings(newSettings);
    saveBillReminderSettings(newSettings);
  };

  const updateBillReminderType = (type: keyof BillReminderSettings['reminderTypes'], value: boolean) => {
    mobileService.lightHaptic();
    const newSettings = {
      ...billReminderSettings,
      reminderTypes: {
        ...billReminderSettings.reminderTypes,
        [type]: value
      }
    };
    setBillReminderSettings(newSettings);
    saveBillReminderSettings(newSettings);
  };

  const notificationTypes = [
    {
      id: 'billReminders',
      title: 'Bill Reminders',
      description: 'Get notified when bills and recurring payments are due',
      icon: Bell,
      isSpecial: true
    },
    {
      id: 'expenses',
      title: 'Expense Alerts',
      description: 'Get notified when expenses are added or updated',
      icon: CreditCard
    },
    {
      id: 'budgets',
      title: 'Budget Alerts',
      description: 'Receive warnings when approaching budget limits',
      icon: PieChart
    },
    {
      id: 'insights',
      title: 'Smart Insights',
      description: 'Get personalized spending insights and tips',
      icon: TrendingUp
    },
    {
      id: 'security',
      title: 'Security Alerts',
      description: 'Important security and account notifications',
      icon: Shield
    },
    {
      id: 'updates',
      title: 'App Updates',
      description: 'New features and app improvement notifications',
      icon: Smartphone
    }
  ];

  const handleEnablePushNotifications = async () => {
    mobileService.lightHaptic();
    try {
      const result = await registerForPush();
      if (result.granted) {
        toast({
          title: "Push notifications enabled",
          description: "You'll now receive bill reminders and other alerts",
          duration: 3000
        });
      } else {
        toast({
          title: "Push notifications not enabled",
          description: result.reason || "Please enable in browser settings",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      toast({
        title: "Error enabling notifications",
        description: "Please try again or check browser settings",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications - MoneyBee</title>
        <meta name="description" content="Manage your notification preferences and bill reminders" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mobileService.lightHaptic();
                navigate(-1);
              }}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Hero Section */}
          <div className="text-center py-6">
            <Bell className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Stay Informed</h2>
            <p className="text-muted-foreground">
              Never miss important bill due dates and financial updates
            </p>
          </div>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {notificationTypes.map((type) => (
                <div key={type.id}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <type.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings[type.id as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) => updateSetting(type.id, checked)}
                    />
                  </div>
                  
                  {/* Bill Reminder Settings */}
                  {type.id === 'billReminders' && notificationSettings.billReminders && (
                    <div className="ml-12 pb-4 space-y-4 border-l-2 border-muted pl-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Reminder Time</Label>
                          <Select 
                            value={billReminderSettings.timeOfDay} 
                            onValueChange={(value) => updateBillReminderSetting('timeOfDay', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="08:00">8:00 AM</SelectItem>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="12:00">12:00 PM</SelectItem>
                              <SelectItem value="18:00">6:00 PM</SelectItem>
                              <SelectItem value="20:00">8:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Days Before</Label>
                          <Select 
                            value={billReminderSettings.daysBeforeDue.toString()} 
                            onValueChange={(value) => updateBillReminderSetting('daysBeforeDue', parseInt(value))}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Same day</SelectItem>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="2">2 days</SelectItem>
                              <SelectItem value="3">3 days</SelectItem>
                              <SelectItem value="7">1 week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Reminder Types</Label>
                        <div className="space-y-2">
                          {[
                            { key: 'dueToday', label: 'Due today' },
                            { key: 'dueTomorrow', label: 'Due tomorrow' },
                            { key: 'dueIn3Days', label: 'Due in 3 days' },
                            { key: 'dueInWeek', label: 'Due in 1 week' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{label}</span>
                              <Switch
                                checked={billReminderSettings.reminderTypes[key as keyof BillReminderSettings['reminderTypes']]}
                                onCheckedChange={(checked) => updateBillReminderType(key as keyof BillReminderSettings['reminderTypes'], checked)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Push Notification Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enable push notifications to receive bill reminders and alerts even when the app is closed.
                </p>
                <Button
                  variant="outline"
                  onClick={handleEnablePushNotifications}
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Push Notifications
                </Button>
                <div className="text-xs text-muted-foreground">
                  <p>
                    📱 For mobile devices, notifications will be sent through your device's notification system.
                  </p>
                  <p className="mt-1">
                    💻 For web browsers, make sure to allow notifications when prompted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}