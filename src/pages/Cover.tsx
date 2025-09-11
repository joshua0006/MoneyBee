import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Shield, TrendingUp } from "lucide-react";
import moneyBeesLogo from "@/assets/moneybees-logo.png";

const Cover = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    localStorage.setItem('cover_seen', 'true');
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleSkip = () => {
    localStorage.setItem('cover_seen', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bee-gold/5 via-background to-bee-blue/5 flex flex-col">
      <Helmet>
        <title>Get Started with MoneyBee - Smart Expense Tracking</title>
        <meta name="description" content="Start your journey to better financial management with MoneyBee's AI-powered expense tracking." />
      </Helmet>

      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-gradient-to-br from-bee-gold via-bee-amber to-accent p-2 rounded-xl shadow-gold">
              <img 
                src={moneyBeesLogo} 
                alt="MoneyBee" 
                className="w-6 h-6 object-contain" 
              />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-bee-gold/20 to-accent/20 rounded-xl blur-sm -z-10"></div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
            MoneyBee
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-bee-gold via-bee-amber to-accent rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-bee-gold via-bee-amber to-accent p-6 sm:p-8 rounded-full shadow-2xl">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-br from-bee-gold/20 to-accent/20 rounded-full blur-xl -z-10"></div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Ready to Transform Your
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
                Financial Journey?
              </h3>
            </div>

            <p className="text-muted-foreground text-base sm:text-lg max-w-sm mx-auto">
              Join thousands who've already improved their spending habits with MoneyBee's smart tracking
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <Card className="p-4 bg-gradient-to-r from-card/80 to-card/60 border-bee-blue/20 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bee-blue/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-bee-blue" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm">Smart Analytics</h4>
                  <p className="text-xs text-muted-foreground">AI-powered insights for better decisions</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-card/80 to-card/60 border-accent/20 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm">Bank-Grade Security</h4>
                  <p className="text-xs text-muted-foreground">Your financial data stays protected</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-bee-gold via-bee-amber to-accent hover:from-bee-amber hover:via-accent hover:to-bee-gold text-white font-semibold py-3 px-6 rounded-xl shadow-gold hover:shadow-xl transition-all duration-300 group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            No credit card required • Free to get started
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cover;