import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { mobileService } from "@/utils/mobileService";

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

interface InvestmentManagerProps {
  investments: Investment[];
  onInvestmentChange: () => void;
}

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stocks', icon: TrendingUp },
  { value: 'crypto', label: 'Cryptocurrency', icon: Bitcoin },
  { value: 'mutual_fund', label: 'Mutual Fund', icon: Building2 },
  { value: 'etf', label: 'ETF', icon: Building2 },
  { value: 'bond', label: 'Bonds', icon: DollarSign },
  { value: 'real_estate', label: 'Real Estate', icon: Building2 },
  { value: 'other', label: 'Other', icon: DollarSign }
];

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  { value: 'moderate', label: 'Moderate Risk', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-800' }
];

export const InvestmentManager = ({ investments, onInvestmentChange }: InvestmentManagerProps) => {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    investment_type: '',
    current_value: '',
    expected_return: '',
    risk_level: 'moderate'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      investment_type: '',
      current_value: '',
      expected_return: '',
      risk_level: 'moderate'
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.investment_type || !formData.current_value || !user?.id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const currentValue = parseFloat(formData.current_value);
    const expectedReturn = parseFloat(formData.expected_return) || 0;

    if (isNaN(currentValue) || currentValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid current value greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const investmentData = {
        user_id: user.id,
        name: formData.name,
        investment_type: formData.investment_type,
        current_value: currentValue,
        expected_return: expectedReturn,
        risk_level: formData.risk_level
      };

      if (editingInvestment) {
        const { error } = await supabase
          .from('user_investments')
          .update(investmentData)
          .eq('id', editingInvestment.id);

        if (error) throw error;

        toast({
          title: "✅ Investment Updated",
          description: `${formData.name} updated successfully`
        });
      } else {
        const { error } = await supabase
          .from('user_investments')
          .insert(investmentData);

        if (error) throw error;

        toast({
          title: "✅ Investment Added",
          description: `${formData.name} added to your portfolio`
        });
      }

      setIsAddDialogOpen(false);
      setEditingInvestment(null);
      resetForm();
      onInvestmentChange();
    } catch (error) {
      console.error('Error saving investment:', error);
      toast({
        title: "Save Error",
        description: "Failed to save investment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (investment: Investment) => {
    setFormData({
      name: investment.name,
      investment_type: investment.investment_type,
      current_value: investment.current_value.toString(),
      expected_return: investment.expected_return.toString(),
      risk_level: investment.risk_level
    });
    setEditingInvestment(investment);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "🗑️ Investment Deleted",
        description: `${name} has been removed from your portfolio`
      });
      onInvestmentChange();
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete investment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInvestmentIcon = (type: string) => {
    const investmentType = INVESTMENT_TYPES.find(t => t.value === type);
    return investmentType?.icon || DollarSign;
  };

  const getRiskLevelStyle = (risk: string) => {
    const riskLevel = RISK_LEVELS.find(r => r.value === risk);
    return riskLevel?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Portfolio</h2>
          <p className="text-muted-foreground">Track your stocks, crypto, and mutual funds</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingInvestment(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
              </DialogTitle>
              <DialogDescription>
                {editingInvestment ? 'Update your investment details' : 'Add a new investment to track your portfolio'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Investment Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Apple Stock, Bitcoin, S&P 500 ETF"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Type and Current Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.investment_type} onValueChange={(value) => setFormData({ ...formData, investment_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="value">Current Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  />
                </div>
              </div>

              {/* Expected Return and Risk Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return">Expected Return (%)</Label>
                  <Input
                    id="return"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.expected_return}
                    onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="risk">Risk Level</Label>
                  <Select value={formData.risk_level} onValueChange={(value) => setFormData({ ...formData, risk_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_LEVELS.map(risk => (
                        <SelectItem key={risk.value} value={risk.value}>
                          {risk.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : (editingInvestment ? 'Update Investment' : 'Add Investment')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingInvestment(null);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Investments Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your investment portfolio by adding your first investment.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Investment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {investments.map((investment) => {
            const Icon = getInvestmentIcon(investment.investment_type);
            const isPositiveReturn = investment.expected_return > 0;
            
            return (
              <Card key={investment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{investment.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {investment.investment_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ${investment.current_value.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 ${isPositiveReturn ? 'text-income' : 'text-expense'}`}>
                            {isPositiveReturn ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="text-sm">{investment.expected_return}%</span>
                          </div>
                          <Badge className={getRiskLevelStyle(investment.risk_level)}>
                            {investment.risk_level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            mobileService.lightHaptic();
                            handleEdit(investment);
                          }}
                          className="p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => mobileService.lightHaptic()}
                              className="p-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Investment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{investment.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(investment.id, investment.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};