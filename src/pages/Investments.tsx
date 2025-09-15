import { ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { mobileService } from "@/utils/mobileService";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { InvestmentManager } from "@/components/InvestmentManager";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Investment {
  id: string;
  user_id: string;
  name: string;
  investment_type: string;
  current_value: number;
  expected_return: number;
  risk_level: string;
  created_at: string;
  updated_at: string;
}

export default function Investments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvestments();
  }, [user]);

  const loadInvestments = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error loading investments:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load investments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInvestmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock':
      case 'stocks':
        return TrendingUp;
      case 'crypto':
      case 'cryptocurrency':
        return Bitcoin;
      case 'mutual fund':
      case 'mutual_fund':
        return Building2;
      default:
        return DollarSign;
    }
  };

  const getTotalValue = () => {
    return investments.reduce((sum, inv) => sum + inv.current_value, 0);
  };

  const getAverageReturn = () => {
    if (investments.length === 0) return 0;
    return investments.reduce((sum, inv) => sum + inv.expected_return, 0) / investments.length;
  };

  const getInvestmentsByType = () => {
    const types: { [key: string]: { count: number; value: number } } = {};
    investments.forEach(inv => {
      if (!types[inv.investment_type]) {
        types[inv.investment_type] = { count: 0, value: 0 };
      }
      types[inv.investment_type].count++;
      types[inv.investment_type].value += inv.current_value;
    });
    return types;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Investments - MoneyBee</title>
        <meta name="description" content="Track your stocks, crypto, and mutual fund investments" />
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
            <h1 className="text-xl font-semibold">Investments</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${getTotalValue().toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Expected Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-income">
                  {getAverageReturn().toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {investments.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Types Breakdown */}
          {investments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(getInvestmentsByType()).map(([type, data]) => {
                    const Icon = getInvestmentIcon(type);
                    const percentage = ((data.value / getTotalValue()) * 100).toFixed(1);
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{data.count} investment{data.count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${data.value.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment Manager */}
          <InvestmentManager 
            investments={investments} 
            onInvestmentChange={loadInvestments}
          />
        </div>
      </div>
    </>
  );
}