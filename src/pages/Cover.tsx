import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  Smartphone,
  Zap,
  Brain,
  Bell,
  RefreshCw,
  CreditCard,
  Star,
  Check,
  X,
  ChevronRight,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Target
} from "lucide-react";
import moneyBeesLogo from "@/assets/moneybees-logo.png";

const Cover = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
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

  // Features data
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Tracking",
      description: "Smart categorization and expense recognition using advanced AI"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Beautiful charts and insights to understand your spending patterns"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your financial data is encrypted and protected with enterprise security"
    },
    {
      icon: CreditCard,
      title: "Credit Card Rewards",
      description: "Track and maximize your credit card rewards and cashback"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get alerts for unusual spending and budget reminders"
    },
    {
      icon: RefreshCw,
      title: "Real-Time Sync",
      description: "Access your data anywhere with seamless cloud synchronization"
    }
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for getting started",
      features: [
        "Track up to 100 transactions",
        "Basic analytics",
        "Mobile app access",
        "Email support"
      ],
      popular: false,
      buttonText: "Get Started Free"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For serious money managers",
      features: [
        "Unlimited transactions",
        "Advanced analytics & reports",
        "Credit card reward tracking",
        "Priority support",
        "Custom categories",
        "Export data"
      ],
      popular: true,
      buttonText: "Start Pro Trial"
    },
    {
      name: "Family",
      price: "$19.99",
      period: "/month",
      description: "Share with your loved ones",
      features: [
        "Everything in Pro",
        "Up to 5 family members",
        "Shared budgets & goals",
        "Family spending insights",
        "Parental controls"
      ],
      popular: false,
      buttonText: "Try Family Plan"
    },
    {
      name: "Business",
      price: "$49.99",
      period: "/month",
      description: "For teams and businesses",
      features: [
        "Everything in Family",
        "Team collaboration",
        "Advanced reporting",
        "API access",
        "Custom integrations",
        "Dedicated support"
      ],
      popular: false,
      buttonText: "Contact Sales"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      avatar: "👩‍💼",
      quote: "MoneyBee helped me save $3,000 in just 6 months. The AI insights are incredible!"
    },
    {
      name: "Mike Chen",
      role: "Software Developer",
      avatar: "👨‍💻",
      quote: "Finally, an expense tracker that actually understands my spending patterns. Love the automation!"
    },
    {
      name: "Emily Rodriguez",
      role: "Small Business Owner",
      avatar: "👩‍🎨",
      quote: "The family plan is perfect for managing both personal and business expenses. Highly recommended!"
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How does AI expense tracking work?",
      answer: "Our AI analyzes your transaction descriptions, amounts, and patterns to automatically categorize expenses. It learns from your corrections and gets smarter over time."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely! We use bank-grade encryption, never store your banking credentials, and follow strict security protocols. Your data is encrypted both in transit and at rest."
    },
    {
      question: "Can I track credit card rewards?",
      answer: "Yes! MoneyBee automatically tracks your credit card rewards, cashback, and points. You can see which cards to use for maximum benefits."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! Our Basic plan is completely free forever. Pro and Family plans come with a 14-day free trial with no credit card required."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your data in CSV, PDF, or Excel formats anytime. We believe your data belongs to you."
    },
    {
      question: "How does family sharing work?",
      answer: "Family members can share budgets, see combined spending insights, and track shared goals while maintaining privacy for personal expenses."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <Helmet>
        <title>MoneyBee - Smart AI Expense Tracking Made Simple</title>
        <meta name="description" content="Transform your financial habits with MoneyBee's AI-powered expense tracking. Get insights, save money, and achieve your financial goals." />
      </Helmet>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
              Skip Tour
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-bee-gold/5 via-background to-bee-blue/5"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-bee-gold/10 text-bee-gold border-bee-gold/20 hover:bg-bee-gold/20">
                ✨ AI-Powered Finance Tracking
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
                Transform Your{" "}
                <span className="bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
                  Financial Journey
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-xl animate-fade-in">
                Join thousands who've improved their spending habits with MoneyBee's smart AI tracking. 
                Save money, reach goals, and make better financial decisions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                <Button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-bee-gold via-bee-amber to-accent hover:from-bee-amber hover:via-accent hover:to-bee-gold text-white font-semibold px-8 py-4 rounded-xl shadow-gold hover:shadow-xl transition-all duration-300 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Loading...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Start Free Today
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4">
                  Watch Demo
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                ✓ No credit card required • ✓ Free forever plan • ✓ 14-day pro trial
              </p>
            </div>
            
            {/* Phone Mockup */}
            <div className="relative mx-auto lg:mx-0">
              <div className="relative w-80 h-96 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-bee-gold/20 via-accent/20 to-bee-blue/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-card via-background to-card rounded-3xl border border-border/50 shadow-2xl p-4 h-full">
                  <div className="bg-gradient-to-br from-bee-gold/5 to-bee-blue/5 rounded-2xl h-full flex flex-col">
                    <div className="text-center py-8">
                      <Smartphone className="w-16 h-16 mx-auto text-bee-blue mb-4" />
                      <h3 className="text-lg font-semibold mb-2">MoneyBee Mobile</h3>
                      <p className="text-sm text-muted-foreground">Track expenses on the go</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-b from-background/50 to-card/50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Coffee</span>
                        <span className="font-medium text-destructive">-$4.50</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Salary</span>
                        <span className="font-medium text-green-600">+$3,200</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Groceries</span>
                        <span className="font-medium text-destructive">-$89.23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-muted/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-bee-blue/10 text-bee-blue border-bee-blue/20">
              🚀 Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-bee-blue to-bee-amber bg-clip-text text-transparent">
                Master Your Money
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the features that make MoneyBee the smartest way to track your expenses and build wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50 bg-gradient-to-br from-card/80 to-background/50">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-bee-gold/20 to-bee-blue/20 rounded-xl flex items-center justify-center group-hover:from-bee-gold/30 group-hover:to-bee-blue/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-bee-blue" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-bee-blue transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              📊 Beautiful Dashboard
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              See Your Money in{" "}
              <span className="bg-gradient-to-r from-accent to-bee-gold bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get instant insights with our beautiful, intuitive dashboard designed for the modern user.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-card to-background rounded-2xl border border-border/50 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-bee-blue" />
                  <h3 className="text-lg font-semibold">Spending Analytics</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Visualize your spending patterns with beautiful charts and actionable insights.
                </p>
                <div className="h-20 bg-gradient-to-r from-bee-blue/20 via-accent/20 to-bee-gold/20 rounded-lg"></div>
              </div>

              <div className="bg-gradient-to-br from-card to-background rounded-2xl border border-border/50 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-accent" />
                  <h3 className="text-lg font-semibold">Budget Goals</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Set and track budgets with smart notifications and progress tracking.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Groceries</span>
                    <span>$340 / $400</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-full w-4/5 bg-gradient-to-r from-bee-gold to-accent rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card to-background rounded-2xl border border-border/50 p-8 shadow-xl">
              <div className="text-center mb-6">
                <DollarSign className="w-16 h-16 mx-auto text-bee-gold mb-4" />
                <h3 className="text-2xl font-bold">Monthly Overview</h3>
                <p className="text-muted-foreground">Your financial snapshot</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border/20">
                  <span className="text-sm font-medium">Total Income</span>
                  <span className="text-lg font-bold text-green-600">$4,250.00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/20">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="text-lg font-bold text-destructive">$2,890.50</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium">Net Savings</span>
                  <span className="text-lg font-bold text-bee-blue">$1,359.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-muted/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-bee-gold/10 text-bee-gold border-bee-gold/20">
              💎 Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-bee-gold to-bee-amber bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free and upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative group transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-bee-gold/50 shadow-xl bg-gradient-to-br from-bee-gold/5 to-bee-amber/5' 
                  : 'border-border/50 hover:shadow-lg bg-gradient-to-br from-card/80 to-background/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-bee-gold to-bee-amber text-white border-0 px-4 py-1">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-bee-gold via-bee-amber to-accent hover:from-bee-amber hover:via-accent hover:to-bee-gold text-white shadow-gold' 
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                    onClick={handleGetStarted}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-bee-blue/10 text-bee-blue border-bee-blue/20">
              💬 Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Loved by{" "}
              <span className="bg-gradient-to-r from-bee-blue to-accent bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our users are saying about their MoneyBee experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-border/50 bg-gradient-to-br from-card/80 to-background/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="flex text-bee-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-muted/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              ❓ Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Got{" "}
              <span className="bg-gradient-to-r from-accent to-bee-blue bg-clip-text text-transparent">
                Questions?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find answers to the most common questions about MoneyBee.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-6 bg-gradient-to-br from-card/80 to-background/50 shadow-soft"
              >
                <AccordionTrigger className="text-left hover:no-underline group">
                  <span className="group-hover:text-bee-blue transition-colors">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-bee-gold/5 via-background to-bee-blue/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="relative mx-auto w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-bee-gold via-bee-amber to-accent rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-bee-gold via-bee-amber to-accent p-4 rounded-full shadow-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-br from-bee-gold/20 to-accent/20 rounded-full blur-xl -z-10"></div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
              Ready to Take Control of{" "}
              <span className="bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
                Your Finances?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who've transformed their financial habits with MoneyBee. 
              Start your journey today - no credit card required!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-bee-gold via-bee-amber to-accent hover:from-bee-amber hover:via-accent hover:to-bee-gold text-white font-semibold px-8 py-4 rounded-xl shadow-gold hover:shadow-xl transition-all duration-300 group text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Start Your Free Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>

              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  ✓ Free forever plan available
                </p>
                <p className="text-sm text-muted-foreground">
                  ✓ No credit card required to start
                </p>
              </div>
            </div>

            <div className="mt-12 flex justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">10,000+ Happy Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-bee-gold via-bee-amber to-accent p-2 rounded-xl shadow-gold">
                  <img 
                    src={moneyBeesLogo} 
                    alt="MoneyBee" 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
                MoneyBee
              </span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2024 MoneyBee. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Made with ❤️ for better financial wellness
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Cover;