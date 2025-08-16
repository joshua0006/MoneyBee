import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useNavigate } from 'react-router-dom';
import { Wallet, PieChart, Target, TrendingUp, Smartphone, Shield } from 'lucide-react';

const introScreens = [
  {
    id: 1,
    icon: <Wallet className="w-16 h-16 text-bee-gold" />,
    title: "Track Every Penny",
    description: "Effortlessly monitor your income and expenses with smart categorization and receipt scanning.",
    gradient: "gradient-gold"
  },
  {
    id: 2,
    icon: <PieChart className="w-16 h-16 text-bee-blue" />,
    title: "Smart Analytics",
    description: "Get insights into your spending patterns with beautiful charts and personalized recommendations.",
    gradient: "gradient-blue"
  },
  {
    id: 3,
    icon: <Target className="w-16 h-16 text-income" />,
    title: "Achieve Your Goals",
    description: "Set financial goals and track your progress with our gamified savings system.",
    gradient: "gradient-income"
  },
  {
    id: 4,
    icon: <TrendingUp className="w-16 h-16 text-accent" />,
    title: "Grow Your Wealth",
    description: "Make informed financial decisions with trend analysis and future projections.",
    gradient: "gradient-amber"
  },
  {
    id: 5,
    icon: <Smartphone className="w-16 h-16 text-primary" />,
    title: "Mobile First",
    description: "Optimized for mobile with offline support, haptic feedback, and native features.",
    gradient: "gradient-blue"
  },
  {
    id: 6,
    icon: <Shield className="w-16 h-16 text-expense" />,
    title: "Bank-Level Security",
    description: "Your financial data is protected with enterprise-grade encryption and biometric authentication.",
    gradient: "gradient-expense"
  }
];

export default function Welcome() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    localStorage.setItem('intro_seen', 'true');
    navigate('/auth');
  };

  const handleSkip = () => {
    localStorage.setItem('intro_seen', 'true');
    navigate('/auth');
  };

  return (
    <>
      <Helmet>
        <title>Welcome to MoneyBee - Smart Financial Tracking</title>
        <meta name="description" content="Discover MoneyBee's powerful features for tracking expenses, analyzing spending, and achieving your financial goals." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="text-3xl font-bold text-bee-gold-foreground">🐝</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">MoneyBee</h1>
            <p className="text-muted-foreground">Your Smart Financial Companion</p>
          </div>

          {/* Carousel */}
          <div className="mb-8">
            <Carousel className="w-full max-w-sm mx-auto">
              <CarouselContent>
                {introScreens.map((screen, index) => (
                  <CarouselItem key={screen.id}>
                    <Card className="border-0 shadow-medium">
                      <CardContent className="flex flex-col items-center text-center p-8 min-h-[400px] justify-center">
                        <div className={`mb-6 p-4 rounded-full ${screen.gradient} shadow-soft`}>
                          {screen.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">
                          {screen.title}
                        </h2>
                        <p className="text-muted-foreground text-base leading-relaxed">
                          {screen.description}
                        </p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {introScreens.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentScreen ? 'bg-primary w-6' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={handleGetStarted}
              className="w-full h-12 text-lg font-semibold gradient-blue hover:scale-105 transition-transform duration-200"
              size="lg"
            >
              Get Started
            </Button>
            <Button 
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Skip Introduction
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Join thousands of users managing their finances smarter</p>
          </div>
        </div>
      </div>
    </>
  );
}