import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Camera, 
  Sparkles,
  ArrowRight,
  Star,
  Play,
  Users,
  Zap
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet-async';

// Simple floating animation for background elements
function FloatingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div 
      className="animate-float"
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '6s',
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden touch-manipulation">
      <Helmet>
        <title>MoneyBee | AI Expense Tracker & Budget App</title>
        <meta name="description" content="Track expenses, scan receipts, and build smart budgets with AI-powered insights. Try MoneyBee free." />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/landing` : '/landing'} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "MoneyBee",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "description": "AI-powered expense tracking, receipt scanning, and smart budgets.",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "url": typeof window !== 'undefined' ? `${window.location.origin}/landing` : '/landing'
          })}
        </script>
      </Helmet>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-secondary/15 to-accent/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-primary/25 to-secondary/25 rounded-full blur-lg animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className={`${isMobile ? 'p-3 pt-safe-top' : 'p-6'} px-safe-left pr-safe-right relative z-10`}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <FloatingCard delay={0}>
              <div className="flex items-center gap-2">
                <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} bg-primary rounded-full flex items-center justify-center`}>
                  🐝
                </div>
                <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>MoneyBee</span>
              </div>
            </FloatingCard>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => navigate('/mobile')} 
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
              >
                Mobile Toolkit
              </Button>
              <Button 
                onClick={handleGetStarted} 
                className="bg-primary hover:bg-primary/90 touch-manipulation min-h-[44px]"
                size={isMobile ? "sm" : "default"}
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <main className={`flex-1 flex items-center justify-center ${isMobile ? 'px-4 py-8' : 'px-6 py-12'} px-safe-left pr-safe-right`}>
          <div className={`${isMobile ? 'max-w-full w-full' : 'max-w-5xl'} mx-auto text-center ${isMobile ? 'space-y-8' : 'space-y-12'}`}>
            <div className={`${isMobile ? 'space-y-6' : 'space-y-8'}`}>
              <FloatingCard delay={0.2}>
                <Badge variant="secondary" className={`${isMobile ? 'mb-4 text-xs px-4 py-2' : 'mb-6 px-6 py-3'} mx-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors`}>
                  <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                  AI-Powered Expense Tracking
                </Badge>
              </FloatingCard>
              <FloatingCard delay={0.4}>
                <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl md:text-7xl'} font-bold leading-tight ${isMobile ? 'px-2' : ''}`}>
                  <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                    Smart Money
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Management
                  </span>
                </h1>
              </FloatingCard>
              <FloatingCard delay={0.6}>
                <p className={`${isMobile ? 'text-lg leading-relaxed' : 'text-xl md:text-2xl'} text-muted-foreground/80 ${isMobile ? 'max-w-sm' : 'max-w-3xl'} mx-auto ${isMobile ? 'px-2' : ''} font-medium`}>
                  Track expenses, build budgets, and grow wealth with AI-powered insights. 
                  <span className="text-primary font-semibold">Your financial future starts here.</span>
                </p>
              </FloatingCard>
            </div>

            <div className={`flex flex-col ${isMobile ? 'gap-4 px-2' : 'gap-6'} justify-center ${isMobile ? 'mt-8' : 'mt-12'}`}>
              <Button 
                size={isMobile ? "lg" : "lg"} 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 touch-manipulation w-full min-h-[52px] font-semibold text-lg"
              >
                <Smartphone className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-2`} />
                Start Free Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className={`flex items-center justify-center ${isMobile ? 'gap-6 text-sm flex-wrap' : 'gap-8 text-sm'} ${isMobile ? 'px-4 py-6' : 'py-8'}`}>
              <FloatingCard delay={0.5}>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Users className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-primary`} />
                  <span className="text-foreground font-medium">10k+ Users</span>
                </div>
              </FloatingCard>
              <FloatingCard delay={1}>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Star className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-accent fill-accent`} />
                  <span className="text-foreground font-medium">4.9/5 Rating</span>
                </div>
              </FloatingCard>
              <FloatingCard delay={1.5}>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Zap className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-secondary`} />
                  <span className="text-foreground font-medium">AI-Powered</span>
                </div>
              </FloatingCard>
            </div>

            {/* Feature Cards */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-6 mt-12 px-2' : 'md:grid-cols-3 gap-8 mt-20'}`}>
              <FloatingCard delay={1}>
                <Card className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-primary/30 touch-manipulation hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105">
                  <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Camera className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} text-primary`} />
                    </div>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold mb-4 text-foreground`}>Smart Receipt Scanning</h3>
                    <p className={`${isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'} text-muted-foreground/80`}>
                      Snap photos of receipts and let AI extract all the details automatically
                    </p>
                  </CardContent>
                </Card>
              </FloatingCard>

              <FloatingCard delay={1.2}>
                <Card className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-accent/30 touch-manipulation hover:shadow-2xl hover:shadow-accent/10 transition-all duration-300 hover:scale-105">
                  <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <PieChart className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} text-accent`} />
                    </div>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold mb-4 text-foreground`}>Intelligent Budgets</h3>
                    <p className={`${isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'} text-muted-foreground/80`}>
                      Set smart spending limits and get insights on your financial habits
                    </p>
                  </CardContent>
                </Card>
              </FloatingCard>

              <FloatingCard delay={1.4}>
                <Card className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-secondary/30 touch-manipulation hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-300 hover:scale-105">
                  <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                    <div className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <TrendingUp className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} text-secondary`} />
                    </div>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold mb-4 text-foreground`}>Wealth Growth</h3>
                    <p className={`${isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'} text-muted-foreground/80`}>
                      Simulate investment scenarios and track your net worth over time
                    </p>
                  </CardContent>
                </Card>
              </FloatingCard>
            </div>
          </div>
        </main>

        {/* Call to Action */}
        <div className={`${isMobile ? 'p-4 pb-safe-bottom' : 'p-6'} text-center px-safe-left pr-safe-right relative z-10`}>
          <FloatingCard delay={2}>
            <p className="text-sm text-muted-foreground mb-4">
              ✨ Ready to transform your finances? ✨
            </p>
            <div className={`flex flex-col ${isMobile ? 'gap-3 px-2' : 'gap-3'} justify-center max-w-md mx-auto`}>
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 touch-manipulation w-full min-h-[48px] font-semibold"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Start Your Financial Journey
              </Button>
            </div>
          </FloatingCard>
        </div>
      </div>
    </div>
  );
}