import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import type { Expense } from '@/types/app';
import * as THREE from 'three';

interface Building {
  id: string;
  type: 'hive' | 'flower' | 'house' | 'shop' | 'garden' | 'fountain';
  position: [number, number, number];
  unlocked: boolean;
  requirement: {
    type: 'savings' | 'streak' | 'budget' | 'transactions';
    value: number;
    description: string;
  };
  reward: number; // honey coins earned
}

interface BeeCityBuilderProps {
  expenses: Expense[];
  totalSavings: number;
  currentStreak: number;
  budgetAdherence: number;
}

// Building Component
const CityBuilding: React.FC<{ building: Building; onClick: () => void }> = ({ building, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && building.unlocked) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const color = building.unlocked ? getBuildingColor(building.type) : '#888888';
  const opacity = building.unlocked ? 1 : 0.3;

  return (
    <Float speed={building.unlocked ? 1 : 0} rotationIntensity={building.unlocked ? 0.2 : 0}>
      <mesh
        ref={meshRef}
        position={building.position}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {getBuildingGeometry(building.type)}
        <meshStandardMaterial color={color} opacity={opacity} transparent />
        
        {building.unlocked && (
          <Html position={[0, 2, 0]} center>
            <div className="bg-bee-gold/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-white shadow-lg">
              +{building.reward} 🍯
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  );
};

// Ground Component
const Ground: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial color="#90EE90" />
  </mesh>
);

// Helper functions
const getBuildingGeometry = (type: Building['type']) => {
  switch (type) {
    case 'hive':
      return <cylinderGeometry args={[0.8, 1, 2, 6]} />;
    case 'flower':
      return <coneGeometry args={[0.5, 1.5, 8]} />;
    case 'house':
      return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    case 'shop':
      return <boxGeometry args={[2, 1, 1.5]} />;
    case 'garden':
      return <cylinderGeometry args={[1.2, 1.2, 0.3, 8]} />;
    case 'fountain':
      return <cylinderGeometry args={[0.8, 0.8, 1.5, 12]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
};

const getBuildingColor = (type: Building['type']): string => {
  switch (type) {
    case 'hive': return '#FFD700';
    case 'flower': return '#FF69B4';
    case 'house': return '#8B4513';
    case 'shop': return '#4169E1';
    case 'garden': return '#32CD32';
    case 'fountain': return '#00BFFF';
    default: return '#888888';
  }
};

export const BeeCityBuilder: React.FC<BeeCityBuilderProps> = ({
  expenses,
  totalSavings,
  currentStreak,
  budgetAdherence
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [honeyCurrency, setHoneyCurrency] = useState(150); // User's honey coins

  // Define all possible buildings
  const allBuildings: Building[] = useMemo(() => [
    {
      id: 'starter-hive',
      type: 'hive',
      position: [0, 0, 0],
      unlocked: true,
      requirement: { type: 'transactions', value: 1, description: 'Add your first expense' },
      reward: 10
    },
    {
      id: 'flower-1',
      type: 'flower',
      position: [-3, 0, 2],
      unlocked: expenses.length >= 5,
      requirement: { type: 'transactions', value: 5, description: 'Track 5 expenses' },
      reward: 15
    },
    {
      id: 'house-1',
      type: 'house',
      position: [3, 0, -2],
      unlocked: totalSavings >= 100,
      requirement: { type: 'savings', value: 100, description: 'Save $100' },
      reward: 25
    },
    {
      id: 'garden-1',
      type: 'garden',
      position: [-2, 0, -3],
      unlocked: currentStreak >= 7,
      requirement: { type: 'streak', value: 7, description: '7-day tracking streak' },
      reward: 30
    },
    {
      id: 'shop-1',
      type: 'shop',
      position: [4, 0, 2],
      unlocked: budgetAdherence >= 80,
      requirement: { type: 'budget', value: 80, description: 'Stay within budget 80%' },
      reward: 40
    },
    {
      id: 'hive-2',
      type: 'hive',
      position: [-4, 0, 0],
      unlocked: totalSavings >= 500,
      requirement: { type: 'savings', value: 500, description: 'Save $500' },
      reward: 50
    },
    {
      id: 'fountain',
      type: 'fountain',
      position: [0, 0, 4],
      unlocked: totalSavings >= 1000 && currentStreak >= 30,
      requirement: { type: 'savings', value: 1000, description: 'Save $1000 + 30-day streak' },
      reward: 100
    }
  ], [expenses.length, totalSavings, currentStreak, budgetAdherence]);

  const unlockedBuildings = allBuildings.filter(b => b.unlocked);
  const nextUnlocked = allBuildings.find(b => !b.unlocked);
  const totalProgress = (unlockedBuildings.length / allBuildings.length) * 100;
  const totalHoneyEarned = unlockedBuildings.reduce((sum, b) => sum + b.reward, 0);

  const handleBuildingClick = (building: Building) => {
    if (building.unlocked) {
      setSelectedBuilding(building);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🏙️ Bee City Progress
              <Badge variant="secondary">{unlockedBuildings.length}/{allBuildings.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-lg">🍯</span>
                <span className="font-bold">{totalHoneyEarned}</span>
              </div>
              <Trophy className="text-bee-gold" size={20} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={totalProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Build your bee metropolis by achieving financial goals!
            </p>
            
            {nextUnlocked && (
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-primary" />
                  <span className="font-medium text-primary">Next Building</span>
                </div>
                <p className="text-sm">{nextUnlocked.requirement.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3D City View */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
              <Environment preset="sunset" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              
              <Ground />
              
              {allBuildings.map((building) => (
                <CityBuilding
                  key={building.id}
                  building={building}
                  onClick={() => handleBuildingClick(building)}
                />
              ))}
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2}
                minDistance={5}
                maxDistance={15}
              />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Building Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allBuildings.map((building) => (
          <Card 
            key={building.id} 
            className={`transition-all duration-200 ${
              building.unlocked 
                ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' 
                : 'border-muted bg-muted/30'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {building.type === 'hive' && '🏠'}
                  {building.type === 'flower' && '🌸'}
                  {building.type === 'house' && '🏘️'}
                  {building.type === 'shop' && '🏪'}
                  {building.type === 'garden' && '🌻'}
                  {building.type === 'fountain' && '⛲'}
                </span>
                {building.unlocked && <Star className="text-bee-gold" size={16} />}
              </div>
              
              <h4 className="font-medium capitalize mb-1">{building.type}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {building.requirement.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1">
                  🍯 {building.reward}
                </span>
                {building.unlocked ? (
                  <Badge variant="default" className="text-xs">Unlocked</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Locked</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-bee-blue" size={20} />
            City Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{unlockedBuildings.length}</div>
              <div className="text-sm text-muted-foreground">Buildings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bee-gold">{totalHoneyEarned}</div>
              <div className="text-sm text-muted-foreground">Honey Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(totalProgress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bee-blue">{expenses.length}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};