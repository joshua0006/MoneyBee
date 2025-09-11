import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  PiggyBank, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Zap, 
  Users, 
  Star,
  Check,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Bell,
  Lock,
  Download,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moneyBeesLogo from "@/assets/moneybees-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Smartphone,
      title: "Smart Expense Tracking",
      description: "Automatically categorize expenses with AI-powered receipt scanning and smart suggestions."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights into your spending patterns with beautiful charts and reports."
    },
    {
      icon: CreditCard,
      title: "Credit Card Rewards",
      description: "Track miles and points earned across all your credit cards automatically."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption and security."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get timely alerts about budget limits, recurring payments, and financial goals."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Access your data instantly across all devices with real-time synchronization."
    }
  ];

  const pricingTiers = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started with expense tracking",
      features: [
        "Track up to 50 transactions per month",
        "Basic expense categories",
        "Simple charts and reports",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99/month",
      description: "Advanced features for serious money managers",
      features: [
        "Unlimited transactions",
        "AI-powered receipt scanning",
        "Advanced analytics and insights",
        "Credit card rewards tracking",
        "Custom categories and tags",
        "Priority support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Family",
      price: "$19.99/month",
      description: "Perfect for families and shared finances",
      features: [
        "Everything in Pro",
        "Up to 6 family members",
        "Shared budgets and goals",
        "Family spending insights",
        "Individual privacy controls",
        "Family financial education"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Business",
      price: "$49.99/month",
      description: "Complete solution for small businesses",
      features: [
        "Everything in Family",
        "Business expense categories",
        "Tax preparation tools",
        "Employee expense tracking",
        "Advanced reporting",
        "API access"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      avatar: "SJ",
      quote: "MoneyBee has completely transformed how I manage my finances. The AI categorization saves me hours every month!"
    },
    {
      name: "Mike Chen",
      role: "Small Business Owner",
      avatar: "MC",
      quote: "The credit card rewards tracking feature has helped me maximize my points. I've earned 3x more rewards this year!"
    },
    {
      name: "Emily Rodriguez",
      role: "Teacher",
      avatar: "ER",
      quote: "As a family of four, the shared budgets feature keeps us all on track. We've saved $2,000 this year using MoneyBee."
    }
  ];

  const faqs = [
    {
      question: "Is MoneyBee secure?",
      answer: "Yes, MoneyBee uses bank-level encryption and follows industry best practices for data security. Your financial information is never stored in plain text and is protected with multi-layer security measures."
    },
    {
      question: "Can I sync data across multiple devices?",
      answer: "Absolutely! MoneyBee syncs your data in real-time across all your devices. Whether you're on your phone, tablet, or computer, your financial information is always up to date."
    },
    {
      question: "Does MoneyBee work with my bank?",
      answer: "MoneyBee supports manual entry and receipt scanning for all banks and financial institutions. We're continuously working on adding direct bank connections for automated transaction imports."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. You'll continue to have access to your paid features until the end of your billing period."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! MoneyBee is available as a progressive web app that works seamlessly on all mobile devices. You can add it to your home screen for a native app experience."
    },
    {
      question: "What if I need help getting started?",
      answer: "We offer comprehensive onboarding for all users, plus priority support for Pro subscribers. Our help center includes tutorials, guides, and FAQs to help you get the most out of MoneyBee."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <img 
                src={moneyBeesLogo} 
                alt="MoneyBee" 
                className="w-5 h-5 object-contain" 
              />
            </div>
            <h1 className="text-xl font-bold text-foreground">MoneyBee</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Take Control of Your
                  <span className="text-primary"> Financial Future</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  MoneyBee makes expense tracking effortless with AI-powered categorization, 
                  smart insights, and beautiful analytics that help you save more and spend smarter.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/auth')} size="lg" className="text-lg px-8 py-6">
                  Start Tracking for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Download className="mr-2 h-5 w-5" />
                  Download App
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Cancel anytime
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-card border rounded-3xl p-8 shadow-elegant">
                  <div className="aspect-[9/16] bg-gradient-primary rounded-2xl p-4 text-primary-foreground">
                    <div className="h-full flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <PiggyBank className="h-6 w-6" />
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm opacity-90">Total Balance</p>
                          <p className="text-2xl font-bold">$12,489.50</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Food & Dining</span>
                            <span className="text-sm font-medium">-$47.50</span>
                          </div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Transportation</span>
                            <span className="text-sm font-medium">-$28.00</span>
                          </div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Shopping</span>
                            <span className="text-sm font-medium">-$156.99</span>
                          </div>
                        </div>
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
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Everything You Need to Master Your Money
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make expense tracking effortless and financial insights actionable.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Beautiful Dashboard, Powerful Insights
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get a complete view of your financial health with our intuitive dashboard and advanced analytics.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-primary">Dashboard</Badge>
                <h3 className="text-2xl font-bold text-foreground">Real-time Financial Overview</h3>
                <p className="text-muted-foreground">
                  See your complete financial picture at a glance. Track income, expenses, and savings goals 
                  with beautiful visualizations that make complex data easy to understand.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Interactive charts and graphs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Spending trend analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Budget progress tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Custom date ranges</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="p-6 shadow-elegant">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">December Overview</h4>
                    <Badge variant="outline">This Month</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-income">$4,250</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-expense">$2,890</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Food & Dining</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div className="w-16 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm">$450</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Transportation</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div className="w-12 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm">$280</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Shopping</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div className="w-8 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm">$190</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as your financial tracking needs grow. All plans include our core features.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`p-6 relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                      {tier.price !== "Free" && tier.price !== "Contact Sales" && (
                        <span className="text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate('/auth')}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Loved by Thousands of Users
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their MoneyBee experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about MoneyBee. Can't find what you're looking for? Contact our support team.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who have already taken control of their finances with MoneyBee. 
              Start your journey to financial freedom today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/auth')} size="lg" className="text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Users className="mr-2 h-5 w-5" />
                Talk to Sales
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Available worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Privacy focused</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <img 
                    src={moneyBeesLogo} 
                    alt="MoneyBee" 
                    className="w-5 h-5 object-contain" 
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground">MoneyBee</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your smart financial companion for tracking expenses, managing budgets, and achieving financial goals.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Updates</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MoneyBee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
