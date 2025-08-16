import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { User, DollarSign, Bell, CheckCircle } from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to MoneyBee!",
    description: "Let's set up your profile to personalize your experience",
    icon: <User className="w-6 h-6 text-bee-blue" />
  },
  {
    id: 2,
    title: "Financial Preferences",
    description: "Tell us about your financial goals and preferences",
    icon: <DollarSign className="w-6 h-6 text-bee-gold" />
  },
  {
    id: 3,
    title: "Notification Settings",
    description: "Choose how you'd like to stay informed",
    icon: <Bell className="w-6 h-6 text-accent" />
  },
  {
    id: 4,
    title: "You're All Set!",
    description: "Welcome to your financial journey with MoneyBee",
    icon: <CheckCircle className="w-6 h-6 text-success" />
  }
];

interface OnboardingData {
  displayName: string;
  currency: string;
  monthlyIncome: string;
  primaryGoal: string;
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
  };
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    currency: 'USD',
    monthlyIncome: '',
    primaryGoal: '',
    notifications: {
      budgetAlerts: true,
      goalReminders: true,
      weeklyReports: false,
    }
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (currentStep / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Save onboarding data to localStorage for now
      localStorage.setItem('onboarding_data', JSON.stringify(data));
      localStorage.setItem('onboarding_completed', 'true');
      
      toast({
        title: "🎉 Welcome to MoneyBee!",
        description: "Your account has been set up successfully.",
        duration: 4000
      });

      // Navigate to main app
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "There was an issue completing your setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="How would you like to be called?"
                value={data.displayName}
                onChange={(e) => setData({...data, displayName: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency">Preferred Currency</Label>
              <Select value={data.currency} onValueChange={(value) => setData({...data, currency: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (Optional)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="Enter your monthly income"
                value={data.monthlyIncome}
                onChange={(e) => setData({...data, monthlyIncome: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="primaryGoal">Primary Financial Goal</Label>
              <Select value={data.primaryGoal} onValueChange={(value) => setData({...data, primaryGoal: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="What's your main goal?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="save_money">Save More Money</SelectItem>
                  <SelectItem value="reduce_expenses">Reduce Expenses</SelectItem>
                  <SelectItem value="budget_better">Budget Better</SelectItem>
                  <SelectItem value="pay_debt">Pay Off Debt</SelectItem>
                  <SelectItem value="invest">Start Investing</SelectItem>
                  <SelectItem value="emergency_fund">Build Emergency Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="budgetAlerts"
                  checked={data.notifications.budgetAlerts}
                  onCheckedChange={(checked) => 
                    setData({
                      ...data, 
                      notifications: {...data.notifications, budgetAlerts: checked as boolean}
                    })
                  }
                />
                <Label htmlFor="budgetAlerts" className="text-sm">
                  Budget alerts when you're close to limits
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goalReminders"
                  checked={data.notifications.goalReminders}
                  onCheckedChange={(checked) => 
                    setData({
                      ...data, 
                      notifications: {...data.notifications, goalReminders: checked as boolean}
                    })
                  }
                />
                <Label htmlFor="goalReminders" className="text-sm">
                  Goal progress reminders
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weeklyReports"
                  checked={data.notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    setData({
                      ...data, 
                      notifications: {...data.notifications, weeklyReports: checked as boolean}
                    })
                  }
                />
                <Label htmlFor="weeklyReports" className="text-sm">
                  Weekly spending reports
                </Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-6">
              <span className="text-3xl">🎉</span>
            </div>
            <div className="space-y-2">
              <p className="text-foreground">
                <strong>Welcome, {data.displayName || 'there'}!</strong>
              </p>
              <p className="text-muted-foreground text-sm">
                You're ready to take control of your finances with MoneyBee.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Setup Your Account - MoneyBee</title>
        <meta name="description" content="Complete your MoneyBee account setup to start managing your finances smarter." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
        <div className="w-full max-w-md mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep} of {onboardingSteps.length}</span>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                Skip
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content Card */}
          <Card className="shadow-medium border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                {onboardingSteps[currentStep - 1]?.icon}
              </div>
              <CardTitle className="text-xl">
                {onboardingSteps[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription>
                {onboardingSteps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex space-x-3 pt-4">
                {currentStep > 1 && currentStep < onboardingSteps.length && (
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < onboardingSteps.length ? (
                  <Button 
                    onClick={handleNext}
                    className="flex-1 gradient-blue hover:scale-105 transition-transform duration-200"
                    disabled={currentStep === 1 && !data.displayName.trim()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComplete}
                    className="w-full gradient-gold hover:scale-105 transition-transform duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Setting up..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            <p>This information helps us personalize your experience</p>
          </div>
        </div>
      </div>
    </>
  );
}