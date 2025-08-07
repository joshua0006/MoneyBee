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
import { InteractiveDemo } from '@/components/3d/InteractiveDemo';
import { GuidedTour } from '@/components/3d/GuidedTour';
import { MobileOptimized3D } from '@/components/3d/MobileOptimized3D';
import { FeatureCallouts } from '@/components/3d/FeatureCallouts';
import { StatsDisplay } from '@/components/3d/StatsDisplay';
import { UserJourneyFlow } from '@/components/3d/UserJourneyFlow';
import { useIsMobile } from '@/hooks/use-mobile';

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
      {/* Background Canvas - Reduced complexity on mobile */}
      <div className={`absolute inset-0 z-0 ${isMobile ? 'opacity-70' : 'opacity-100'}`}>
        <Canvas
          camera={{ position: isMobile ? [0, 0, 10] : [0, 0, 8] }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          performance={{ min: 0.5 }}
          gl={{ 
            antialias: !isMobile,
            alpha: false,
            powerPreference: isMobile ? "low-power" : "high-performance"
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={isMobile ? 0.6 : 0.4} />
            {!isMobile && <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />}
            <pointLight position={[-10, -10, -10]} intensity={isMobile ? 0.3 : 0.5} />
            
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
            <StatsDisplay position={[0, 4, 0]} />

            {/* User Journey Flow */}
            <UserJourneyFlow 
              position={[0, -4, 2]} 
              isActive={showJourney}
            />
            
            {!isMobile && <Chart3D position={[0, -3, 0]} />}
            
            {/* Guided Tour */}
            <GuidedTour
              isActive={showTour}
              onClose={() => setShowTour(false)}
              onGetStarted={handleGetStarted}
            />
            
            <Environment preset={isMobile ? "sunset" : "city"} />
            <OrbitControls
              enablePan={false}
              enableZoom={!isMobile}
              enableRotate={!isMobile}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
              autoRotate={isMobile}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen flex flex-col safe-area-top safe-area-bottom">
        {/* Header */}
        <header className={`${isMobile ? 'p-4' : 'p-6'} safe-area-left safe-area-right`}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
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
                onClick={handleGetStarted} 
                className="bg-primary hover:bg-primary/90 touch-manipulation"
                size={isMobile ? "sm" : "default"}
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <main className={`flex-1 flex items-center justify-center ${isMobile ? 'px-4 py-6' : 'px-6'} safe-area-left safe-area-right`}>
          <div className={`${isMobile ? 'max-w-sm' : 'max-w-4xl'} mx-auto text-center ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <Badge variant="secondary" className={`${isMobile ? 'mb-2 text-xs' : 'mb-4'}`}>
                <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                AI-Powered Expense Tracking
              </Badge>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-6xl'} font-bold text-foreground leading-tight`}>
                Smart Money
                <span className="text-primary"> Management</span>
              </h1>
              <p className={`${isMobile ? 'text-base' : 'text-xl md:text-2xl'} text-muted-foreground ${isMobile ? 'max-w-xs' : 'max-w-2xl'} mx-auto`}>
                Track expenses, build budgets, and grow wealth with AI-powered insights. 
                Your financial future starts here.
              </p>
            </div>

            <div className={`flex flex-col ${isMobile ? 'gap-3' : 'gap-4'} justify-center`}>
              <Button 
                size={isMobile ? "default" : "lg"} 
                onClick={handleGetStarted} 
                className="bg-primary hover:bg-primary/90 touch-manipulation w-full"
              >
                <Smartphone className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-2`} />
                Start Free Demo
              </Button>
              {!isMobile && (
                <Button size="lg" variant="outline" onClick={handleStartTour} className="w-full sm:w-auto">
                  <Play className="w-5 h-5 mr-2" />
                  Interactive Tour
                </Button>
              )}
            </div>

            {/* Social Proof */}
            <div className={`flex items-center justify-center ${isMobile ? 'gap-3 text-xs' : 'gap-6 text-sm'} text-muted-foreground ${isMobile ? 'flex-wrap' : ''}`}>
              <div className="flex items-center gap-1">
                <Users className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                10k+ Users
              </div>
              <div className="flex items-center gap-1">
                <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                4.9/5 Rating
              </div>
              <div className="flex items-center gap-1">
                <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                AI-Powered
              </div>
            </div>

          {/* Feature Cards */}
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-3 mt-6' : 'md:grid-cols-3 gap-6 mt-16'}`}>
            <Card className="glass-card touch-manipulation">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                <Camera className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} mx-auto mb-4 text-primary`} />
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Smart Receipt Scanning</h3>
                <p className="text-sm text-muted-foreground">
                  Snap photos of receipts and let AI extract all the details automatically
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card touch-manipulation">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                <PieChart className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} mx-auto mb-4 text-primary`} />
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Intelligent Budgets</h3>
                <p className="text-sm text-muted-foreground">
                  Set smart spending limits and get insights on your financial habits
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card touch-manipulation">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                <TrendingUp className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} mx-auto mb-4 text-primary`} />
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Wealth Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Simulate investment scenarios and track your net worth over time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

        {/* Call to Action */}
        <div className={`${isMobile ? 'p-4' : 'p-6'} text-center safe-area-left safe-area-right`}>
          {!isMobile && (
            <p className="text-sm text-muted-foreground mb-4">
              ✨ Click the phone above to see the app in action ✨
            </p>
          )}
          <div className="flex flex-col gap-3 justify-center">
            <Button 
              onClick={handleGetStarted} 
              size={isMobile ? "default" : "lg"} 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 touch-manipulation w-full"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Start Your Financial Journey
            </Button>
            {!isMobile && (
              <Button 
                onClick={handleStartTour}
                size="lg" 
                variant="outline"
                className="w-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Take Interactive Tour
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/60 backdrop-blur-sm touch-manipulation"
              onClick={() => setShowJourney(!showJourney)}
            >
              {showJourney ? 'Hide' : 'Show'} User Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}