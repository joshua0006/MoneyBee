import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Float, 
  PerspectiveCamera,
  AdaptiveDpr,
  AdaptiveEvents
} from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface MobileOptimized3DProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType;
  enableControls?: boolean;
}

// Performance detection hook
function usePerformanceLevel() {
  const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setSupportsWebGL(false);
      return;
    }

    // Detect device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasLimitedMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
    const isSlowConnection = (navigator as any).connection && 
      ((navigator as any).connection.effectiveType === 'slow-2g' || 
       (navigator as any).connection.effectiveType === '2g');

    // Determine performance level
    if (isMobile && (hasLimitedMemory || isSlowConnection)) {
      setPerformanceLevel('low');
    } else if (isMobile || hasLimitedMemory) {
      setPerformanceLevel('medium');
    } else {
      setPerformanceLevel('high');
    }
  }, []);

  return { performanceLevel, supportsWebGL };
}

// Fallback 2D component
function Fallback2D() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-2xl">
            🐝
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">MoneyBee</h2>
            <p className="text-muted-foreground">
              Smart AI-powered expense tracking for your financial future
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <Smartphone className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="font-medium text-sm">Smart Receipt Scanning</div>
                <div className="text-xs text-muted-foreground">AI-powered OCR technology</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <div className="w-5 h-5 text-primary">📊</div>
              <div className="text-left">
                <div className="font-medium text-sm">Intelligent Budgeting</div>
                <div className="text-xs text-muted-foreground">Set smart spending limits</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              <div className="w-5 h-5 text-primary">📈</div>
              <div className="text-left">
                <div className="font-medium text-sm">Wealth Tracking</div>
                <div className="text-xs text-muted-foreground">Monitor net worth growth</div>
              </div>
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90">
            Start Your Financial Journey
          </Button>

          <Badge variant="secondary" className="text-xs">
            💡 For the full 3D experience, try on desktop
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component
function Loading3D() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
            🐝
          </div>
          <div>
            <div className="font-semibold">Loading MoneyBee Experience</div>
            <div className="text-sm text-muted-foreground">Preparing your 3D demo...</div>
          </div>
          <div className="w-32 h-2 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function MobileOptimized3D({ 
  children, 
  fallbackComponent: FallbackComponent = Fallback2D,
  enableControls = true 
}: MobileOptimized3DProps) {
  const { performanceLevel, supportsWebGL } = usePerformanceLevel();
  const [show3D, setShow3D] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Force 2D mode for unsupported devices
  if (!supportsWebGL || (!show3D && performanceLevel === 'low')) {
    return <FallbackComponent />;
  }

  if (isLoading) {
    return <Loading3D />;
  }

  // Performance settings based on device capability
  const getCanvasSettings = () => {
    switch (performanceLevel) {
      case 'low':
        return {
          antialias: false,
          alpha: false,
          powerPreference: 'low-power' as const,
          stencil: false,
          depth: false
        };
      case 'medium':
        return {
          antialias: false,
          alpha: true,
          powerPreference: 'default' as const
        };
      default:
        return {
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance' as const
        };
    }
  };

  return (
    <div className="relative">
      {/* Performance Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/80 backdrop-blur-sm"
          onClick={() => setShow3D(!show3D)}
        >
          {show3D ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        
        {performanceLevel !== 'high' && (
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
            {performanceLevel === 'medium' ? '⚡ Optimized' : '🔋 Power Saving'}
          </Badge>
        )}
      </div>

      <Canvas
        {...getCanvasSettings()}
        className="w-full h-full"
        onCreated={({ gl }) => {
          // Additional optimizations
          if (performanceLevel !== 'high') {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Adaptive performance components */}
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          
          {/* Camera with constraints for mobile */}
          <PerspectiveCamera 
            makeDefault 
            position={[0, 0, performanceLevel === 'low' ? 10 : 8]} 
          />
          
          {/* Lighting - simplified for low performance */}
          <ambientLight intensity={performanceLevel === 'low' ? 0.6 : 0.4} />
          {performanceLevel !== 'low' && (
            <>
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
            </>
          )}
          
          {children}
          
          {/* Environment - simplified for low performance */}
          {performanceLevel === 'high' ? (
            <Environment preset="city" />
          ) : (
            <Environment preset="dawn" />
          )}
          
          {/* Controls with mobile-friendly settings */}
          {enableControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={performanceLevel !== 'low'}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
              maxDistance={performanceLevel === 'low' ? 12 : 15}
              minDistance={performanceLevel === 'low' ? 8 : 5}
              dampingFactor={0.05}
              rotateSpeed={0.5}
              zoomSpeed={0.5}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Mobile help overlay */}
      {performanceLevel !== 'high' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20">
            <CardContent className="p-3">
              <div className="text-xs text-center text-muted-foreground">
                📱 Drag to rotate • {performanceLevel !== 'low' && 'Pinch to zoom • '}
                Tap features to interact
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}