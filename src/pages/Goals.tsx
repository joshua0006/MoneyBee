import { useState } from "react";
import { ArrowLeft, Target, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";

export default function Goals() {
  const navigate = useNavigate();
  const [goals] = useState([
    {
      id: 1,
      title: "Emergency Fund",
      target: 5000,
      current: 2500,
      category: "savings",
      deadline: "2024-12-31"
    },
    {
      id: 2,
      title: "Vacation Fund",
      target: 2000,
      current: 800,
      category: "travel",
      deadline: "2024-08-15"
    }
  ]);

  return (
    <>
      <Helmet>
        <title>Goals - MoneyBee</title>
        <meta name="description" content="Set and track your financial goals to achieve your dreams" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                mobileService.lightHaptic();
                navigate(-1);
              }}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Goals</h1>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mobileService.lightHaptic()}
              >
                <Plus size={16} className="mr-1" />
                Add Goal
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Goals</p>
                    <p className="text-2xl font-bold">{goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-2xl font-bold">${goals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals List */}
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <Card key={goal.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State for no goals */}
          {goals.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Set your first financial goal to start tracking your progress
              </p>
              <Button onClick={() => mobileService.lightHaptic()}>
                <Plus size={16} className="mr-2" />
                Create Your First Goal
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}