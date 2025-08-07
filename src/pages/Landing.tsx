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
  Star
} from 'lucide-react';
import * as THREE from 'three';

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

// 3D Phone component
function Phone3D({ onClick }: { onClick: () => void }) {
  const phoneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      <group ref={phoneRef} onClick={onClick}>
        {/* Phone body */}
        <RoundedBox args={[1.2, 2.2, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#1a1a1a" />
        </RoundedBox>
        
        {/* Screen */}
        <RoundedBox args={[1.1, 2, 0.02]} radius={0.08} smoothness={4} position={[0, 0, 0.06]}>
          <meshStandardMaterial color="#000" />
        </RoundedBox>
        
        {/* Screen content overlay */}
        <Html
          transform
          occlude
          position={[0, 0, 0.07]}
          style={{
            width: '300px',
            height: '550px',
            borderRadius: '20px',
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4 flex flex-col justify-between text-white text-xs">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  🐝
                </div>
                <span className="font-bold">MoneyBee</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white/10 rounded p-2">
                  <span className="text-green-300">+$1,250</span>
                  <div className="text-xs opacity-80">Salary</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <span className="text-red-300">-$45</span>
                  <div className="text-xs opacity-80">Coffee Shop</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <span className="text-red-300">-$120</span>
                  <div className="text-xs opacity-80">Groceries</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded p-2">
              <div className="text-xs opacity-80">Net Worth</div>
              <span className="text-lg font-bold text-green-300">$12,450</span>
            </div>
          </div>
        </Html>
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
  const [currentDemo, setCurrentDemo] = useState('overview');
  
  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handlePhoneClick = () => {
    setCurrentDemo(currentDemo === 'overview' ? 'expenses' : 'overview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            
            <FloatingParticles />
            
            <Phone3D onClick={handlePhoneClick} />
            
            <FeatureBubble
              position={[-3, 2, 0]}
              icon={<Camera className="w-6 h-6" />}
              title="Smart Scanning"
              description="Snap receipts with AI-powered OCR"
              color="#4F46E5"
            />
            
            <FeatureBubble
              position={[3, 1, 0]}
              icon={<Brain className="w-6 h-6" />}
              title="AI Categorization"
              description="Automatically categorize expenses"
              color="#06B6D4"
            />
            
            <FeatureBubble
              position={[-2, -1, 0]}
              icon={<PieChart className="w-6 h-6" />}
              title="Smart Budgets"
              description="Set and track spending goals"
              color="#10B981"
            />
            
            <FeatureBubble
              position={[3, -2, 0]}
              icon={<TrendingUp className="w-6 h-6" />}
              title="Wealth Tracking"
              description="Monitor your net worth growth"
              color="#F59E0B"
            />
            
            <Chart3D position={[0, -3, 0]} />
            
            <Environment preset="city" />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                🐝
              </div>
              <span className="text-xl font-bold text-foreground">MoneyBee</span>
            </div>
            <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Expense Tracking
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Smart Money
                <span className="text-primary"> Management</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Track expenses, build budgets, and grow wealth with AI-powered insights. 
                Your financial future starts here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
                <Smartphone className="w-5 h-5 mr-2" />
                Start Free Demo
              </Button>
              <Button size="lg" variant="outline">
                <Star className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Smart Receipt Scanning</h3>
                  <p className="text-sm text-muted-foreground">
                    Snap photos of receipts and let AI extract all the details automatically
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Intelligent Budgets</h3>
                  <p className="text-sm text-muted-foreground">
                    Set smart spending limits and get insights on your financial habits
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Wealth Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Simulate investment scenarios and track your net worth over time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Call to Action */}
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            ✨ Click the phone above to see the app in action ✨
          </p>
          <Button 
            onClick={handleGetStarted} 
            size="lg" 
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Start Your Financial Journey
          </Button>
        </div>
      </div>
    </div>
  );
}