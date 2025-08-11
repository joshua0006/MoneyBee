import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float, 
  Text3D, 
  Center, 
  Html, 
  PerspectiveCamera,
  useTexture,
  Sphere,
  Box,
  RoundedBox
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
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
  Brain,
  Sparkles,
  ArrowRight,
  Star,
  Play,
  Users,
  Zap
} from 'lucide-react';
import * as THREE from 'three';
const InteractiveDemo = React.lazy(() => import('@/components/3d/InteractiveDemo').then(m => ({ default: m.InteractiveDemo })));
const GuidedTour = React.lazy(() => import('@/components/3d/GuidedTour').then(m => ({ default: m.GuidedTour })));
const MobileOptimized3D = React.lazy(() => import('@/components/3d/MobileOptimized3D').then(m => ({ default: m.MobileOptimized3D })));
const FeatureCallouts = React.lazy(() => import('@/components/3d/FeatureCallouts').then(m => ({ default: m.FeatureCallouts })));
const StatsDisplay = React.lazy(() => import('@/components/3d/StatsDisplay').then(m => ({ default: m.StatsDisplay })));
const UserJourneyFlow = React.lazy(() => import('@/components/3d/UserJourneyFlow').then(m => ({ default: m.UserJourneyFlow })));

import { useIsMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet-async';

// Floating particles for background
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  const particlePositions = React.useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.05} />
    </points>
  );
}

// 3D Phone component with enhanced interactivity
function Phone3D({ demoState, onDemoStateChange }: { 
  demoState: any; 
  onDemoStateChange: (state: any) => void;
}) {
  const phoneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      <group 
        ref={phoneRef} 
        onClick={() => onDemoStateChange({ 
          screen: demoState.screen === 'dashboard' ? 'expenses' : 'dashboard' 
        })}
      >
        {/* Phone body */}
        <RoundedBox args={[1.2, 2.2, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#1a1a1a" />
        </RoundedBox>
        
        {/* Screen */}
        <RoundedBox args={[1.1, 2, 0.02]} radius={0.08} smoothness={4} position={[0, 0, 0.06]}>
          <meshStandardMaterial color="#000" />
        </RoundedBox>
        
        {/* Interactive Demo Content */}
        <InteractiveDemo demoState={demoState} onStateChange={onDemoStateChange} />
      </group>
    </Float>
  );
}

// Feature bubble component
function FeatureBubble({ 
  position, 
  icon, 
  title, 
  description, 
  color = "#FFD700" 
}: {
  position: [number, number, number];
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}) {
  const bubbleRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (bubbleRef.current) {
      bubbleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={bubbleRef} position={position}>
        <Sphere args={[0.3]} position={[0, 0, 0]}>
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </Sphere>
        <Html center>
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg min-w-[200px] text-center">
            <div className="flex justify-center mb-2 text-primary">
              {icon}
            </div>
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// 3D Chart component
function Chart3D({ position }: { position: [number, number, number] }) {
  const chartRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (chartRef.current) {
      chartRef.current.rotation.y += 0.01;
    }
  });

  const heights = [0.5, 0.8, 1.2, 0.9, 1.5, 1.1, 1.8];

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={chartRef} position={position}>
        {heights.map((height, index) => (
          <Box key={index} args={[0.1, height, 0.1]} position={[(index - 3) * 0.15, height / 2, 0]}>
            <meshStandardMaterial color={`hsl(${120 + index * 30}, 70%, 50%)`} />
          </Box>
        ))}
        <Html center position={[0, -0.5, 0]}>
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center">
            <div className="text-xs font-semibold text-green-600">📈 Growing Wealth</div>
            <div className="text-xs text-gray-600">Track your progress</div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [demoState, setDemoState] = useState({ screen: 'dashboard' });
  const [showTour, setShowTour] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showJourney, setShowJourney] = useState(false);
  
  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(activeFeature === featureId ? null : featureId);
    
    // Update demo state based on feature
    switch (featureId) {
      case 'ai-scanning':
        setDemoState({ screen: 'scanning' });
        break;
      case 'ai-categorization':
        setDemoState({ screen: 'categories' });
        break;
      case 'smart-budgets':
        setDemoState({ screen: 'budgets' });
        break;
      case 'wealth-tracking':
        setDemoState({ screen: 'analytics' });
        break;
      default:
        setDemoState({ screen: 'dashboard' });
    }
  };

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleDemoStateChange = (newState: any) => {
    setDemoState(newState);
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
      {/* Background Canvas - Reduced complexity on mobile */}
      <div className={`absolute inset-0 z-0 ${isMobile ? 'opacity-70' : 'opacity-100'}`}>
        <Canvas
          camera={{ position: isMobile ? [0, 0, 10] : [0, 0, 8] }}
          dpr={isMobile ? [0.5, 1] : [1, 1.5]}
          performance={{ min: 0.3, max: 0.8 }}
          gl={{ 
            antialias: false,
            alpha: false,
            powerPreference: "low-power",
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: true
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f8f9fa', 0);
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={0.4} />
            
            {!isMobile && <FloatingParticles />}
            
            <Phone3D demoState={demoState} onDemoStateChange={handleDemoStateChange} />
            
            {/* Feature Callouts - Simplified on mobile */}
            {!isMobile && (
              <FeatureCallouts 
                onFeatureClick={handleFeatureClick}
                activeFeature={activeFeature}
              />
            )}

            {/* Stats Display */}
            {!isMobile && <StatsDisplay position={[0, 4, 0]} />}

            {/* User Journey Flow */}
            {!isMobile && showJourney && (
              <UserJourneyFlow 
                position={[0, -4, 2]} 
                isActive={showJourney}
              />
            )}
            
            {!isMobile && <Chart3D position={[0, -3, 0]} />}
            
            {/* Guided Tour */}
            {!isMobile && (
              <GuidedTour
                isActive={showTour}
                onClose={() => setShowTour(false)}
                onGetStarted={handleGetStarted}
              />
            )}
            
            <Environment preset="dawn" />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={!isMobile}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
              autoRotate={true}
              autoRotateSpeed={0.3}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className={`${isMobile ? 'p-3 pt-safe-top' : 'p-6'} px-safe-left pr-safe-right`}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} bg-primary rounded-full flex items-center justify-center`}>
                🐝
              </div>
              <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>MoneyBee</span>
            </div>
            <div className="flex items-center gap-2">
              {!isMobile && (
                <Button variant="outline" onClick={handleStartTour} className="hidden sm:flex">
                  <Play className="w-4 h-4 mr-2" />
                  Take Tour
                </Button>
              )}
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
              <Badge variant="secondary" className={`${isMobile ? 'mb-4 text-xs px-4 py-2' : 'mb-6 px-6 py-3'} mx-auto bg-bee-primary/10 text-bee-primary border-bee-primary/20 hover:bg-bee-primary/20 transition-colors`}>
                <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                AI-Powered Expense Tracking
              </Badge>
              <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl md:text-7xl'} font-bold leading-tight ${isMobile ? 'px-2' : ''}`}>
                <span className="bg-gradient-to-r from-foreground via-bee-primary to-bee-secondary bg-clip-text text-transparent">
                  Smart Money
                </span>
                <br />
                <span className="bg-gradient-to-r from-bee-primary to-bee-accent bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className={`${isMobile ? 'text-lg leading-relaxed' : 'text-xl md:text-2xl'} text-muted-foreground/80 ${isMobile ? 'max-w-sm' : 'max-w-3xl'} mx-auto ${isMobile ? 'px-2' : ''} font-medium`}>
                Track expenses, build budgets, and grow wealth with AI-powered insights. 
                <span className="text-bee-primary font-semibold">Your financial future starts here.</span>
              </p>
            </div>

            <div className={`flex flex-col ${isMobile ? 'gap-4 px-2' : 'gap-6'} justify-center ${isMobile ? 'mt-8' : 'mt-12'}`}>
              <Button 
                size={isMobile ? "lg" : "lg"} 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-bee-primary to-bee-secondary hover:from-bee-primary/90 hover:to-bee-secondary/90 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 touch-manipulation w-full min-h-[52px] font-semibold text-lg"
              >
                <Smartphone className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} mr-2`} />
                Start Free Demo
              </Button>
              {isMobile && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleStartTour} 
                  className="w-full min-h-[48px] font-medium border-bee-primary/30 text-bee-primary hover:bg-bee-primary/10 hover:border-bee-primary/50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Interactive Tour
                </Button>
              )}
            </div>

            {/* Social Proof */}
            <div className={`flex items-center justify-center ${isMobile ? 'gap-6 text-sm flex-wrap' : 'gap-8 text-sm'} ${isMobile ? 'px-4 py-6' : 'py-8'}`}>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Users className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-bee-primary`} />
                <span className="text-foreground font-medium">10k+ Users</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Star className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-bee-accent fill-bee-accent`} />
                <span className="text-foreground font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Zap className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-bee-secondary`} />
                <span className="text-foreground font-medium">AI-Powered</span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-6 mt-12 px-2' : 'md:grid-cols-3 gap-8 mt-20'}`}>
              <Card className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-bee-primary/30 touch-manipulation hover:shadow-2xl hover:shadow-bee-primary/10 transition-all duration-300 hover:scale-105">
                <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                  <div className="bg-gradient-to-br from-bee-primary/20 to-bee-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Camera className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} text-bee-primary`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold mb-4 text-foreground`}>Smart Receipt Scanning</h3>
                  <p className={`${isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'} text-muted-foreground/80`}>
                    Snap photos of receipts and let AI extract all the details automatically
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-bee-accent/30 touch-manipulation hover:shadow-2xl hover:shadow-bee-accent/10 transition-all duration-300 hover:scale-105">
                <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                  <div className="bg-gradient-to-br from-bee-accent/20 to-bee-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <PieChart className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} text-bee-accent`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold mb-4 text-foreground`}>Intelligent Budgets</h3>
                  <p className={`${isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'} text-muted-foreground/80`}>
                    Set smart spending limits and get insights on your financial habits
                  </p>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-bee-secondary/30 touch-manipulation hover:shadow-2xl hover:shadow-bee-secondary/10 transition-all duration-300 hover:scale-105">
                <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                  <div className="bg-gradient-to-br from-bee-secondary/20 to-bee-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <TrendingUp className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8'} text-bee-secondary`} />
                  </div>
                  <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold mb-4 text-foreground`}>Wealth Growth</h3>
                  <p className={`${isMobile ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'} text-muted-foreground/80`}>
                    Simulate investment scenarios and track your net worth over time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Call to Action */}
        <div className={`${isMobile ? 'p-4 pb-safe-bottom' : 'p-6'} text-center px-safe-left pr-safe-right`}>
          {!isMobile && (
            <p className="text-sm text-muted-foreground mb-4">
              ✨ Click the phone above to see the app in action ✨
            </p>
          )}
          {isMobile && (
            <p className="text-sm text-muted-foreground mb-4">
              ✨ Ready to transform your finances? ✨
            </p>
          )}
          <div className={`flex flex-col ${isMobile ? 'gap-3 px-2' : 'gap-3'} justify-center max-w-md mx-auto`}>
            <Button 
              onClick={handleGetStarted} 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 touch-manipulation w-full min-h-[48px] font-semibold"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Start Your Financial Journey
            </Button>
            {!isMobile && (
              <Button 
                onClick={handleStartTour}
                size="lg" 
                variant="outline"
                className="w-full min-h-[48px]"
              >
                <Play className="w-5 h-5 mr-2" />
                Take Interactive Tour
              </Button>
            )}
            
            {!isMobile && (
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/60 backdrop-blur-sm touch-manipulation"
                onClick={() => setShowJourney(!showJourney)}
              >
                {showJourney ? 'Hide' : 'Show'} User Journey
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}