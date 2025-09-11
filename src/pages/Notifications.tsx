import { useState } from "react";
import { ArrowLeft, Bell, BellRing, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";

export default function Notifications() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    expenseReminders: false,
    goalUpdates: true,
    weeklyReports: true,
    recurringReminders: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    mobileService.lightHaptic();
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const notificationTypes = [
    {
      id: 'budgetAlerts',
      title: 'Budget Alerts',
      description: 'Get notified when you approach or exceed budget limits',
      icon: DollarSign,
    },
    {
      id: 'expenseReminders',
      title: 'Expense Reminders',
      description: 'Daily reminders to track your expenses',
      icon: Bell,
    },
    {
      id: 'goalUpdates',
      title: 'Goal Progress',
      description: 'Updates on your financial goal progress',
      icon: BellRing,
    },
    {
      id: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Summary of your weekly spending and income',
      icon: Clock,
    },
    {
      id: 'recurringReminders',
      title: 'Recurring Payments',
      description: 'Reminders for upcoming recurring transactions',
      icon: Clock,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Notifications - MoneyBee</title>
        <meta name="description" content="Manage your notification preferences and alerts" />
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
        <div className="p-4 space-y-4">
          <div className="text-center py-6">
            <Bell className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Stay Informed</h2>
            <p className="text-muted-foreground">
              Choose which notifications you'd like to receive
            </p>
          </div>

          <div className="space-y-3">
            {notificationTypes.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <type.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[type.id as keyof typeof settings]}
                      onCheckedChange={(checked) => updateSetting(type.id, checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Push Notification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enable push notifications in your browser settings to receive alerts even when the app is closed.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    mobileService.lightHaptic();
                    // Request notification permission
                    if ('Notification' in window) {
                      Notification.requestPermission();
                    }
                  }}
                  className="w-full"
                >
                  Enable Push Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}