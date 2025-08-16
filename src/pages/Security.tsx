import { useState } from "react";
import { ArrowLeft, Shield, Lock, Fingerprint, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";

export default function Security() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    biometricAuth: false,
    appLock: true,
    autoLock: true,
    lockTimeout: 5, // minutes
  });

  const updateSecuritySetting = (key: string, value: boolean | number) => {
    mobileService.lightHaptic();
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "🔒 Security Updated",
      description: "Your security settings have been saved",
    });
  };

  const securityOptions = [
    {
      id: 'biometricAuth',
      title: 'Biometric Authentication',
      description: 'Use fingerprint or face recognition to unlock the app',
      icon: Fingerprint,
    },
    {
      id: 'appLock',
      title: 'App Lock',
      description: 'Require authentication to open the app',
      icon: Lock,
    },
    {
      id: 'autoLock',
      title: 'Auto Lock',
      description: 'Lock the app automatically after inactivity',
      icon: Shield,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Security - MoneyBee</title>
        <meta name="description" content="Manage your app security settings and privacy preferences" />
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
            <h1 className="text-xl font-semibold">Security</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <div className="text-center py-6">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
            <p className="text-muted-foreground">
              Keep your financial data safe and secure
            </p>
          </div>

          {/* Security Options */}
          <div className="space-y-3">
            {securityOptions.map((option) => (
              <Card key={option.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <option.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings[option.id as keyof typeof securitySettings] as boolean}
                      onCheckedChange={(checked) => updateSecuritySetting(option.id, checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Auto Lock Timeout */}
          {securitySettings.autoLock && (
            <Card>
              <CardHeader>
                <CardTitle>Auto Lock Timeout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Lock after (minutes)</Label>
                  <div className="flex gap-2">
                    {[1, 5, 15, 30].map((minutes) => (
                      <Button
                        key={minutes}
                        variant={securitySettings.lockTimeout === minutes ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSecuritySetting('lockTimeout', minutes)}
                      >
                        {minutes}m
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  mobileService.lightHaptic();
                  toast({
                    title: "🔑 Password Updated",
                    description: "Your password has been changed successfully",
                  });
                }}
                className="w-full"
              >
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Data Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your financial data is encrypted and stored securely. We never share your personal information with third parties.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Privacy Policy
                </Button>
                <Button variant="outline" size="sm">
                  Data Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}