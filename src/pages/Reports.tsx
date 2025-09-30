import { useState } from "react";
import { ArrowLeft, Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";

export default function Reports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { expenses, accounts, budgets } = useAppData();

  const exportData = (format: string) => {
    mobileService.lightHaptic();
    
    if (format === 'csv') {
      const csvContent = [
        ['Date', 'Description', 'Amount', 'Category', 'Type', 'Account'].join(','),
        ...expenses.map(expense => [
          expense.date,
          expense.description,
          expense.amount,
          expense.category,
          expense.type,
          expense.accountId || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneybee-expenses-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "📊 Export Complete",
        description: "Your expense report has been downloaded",
      });
    } else if (format === 'json') {
      const jsonData = {
        expenses,
        accounts,
        budgets,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneybee-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "📁 Export Complete",
        description: "Your complete data has been downloaded",
      });
    }
  };

  const reportTypes = [
    {
      title: "Monthly Summary",
      description: "Complete overview of income and expenses",
      icon: Calendar,
      action: () => exportData('csv')
    },
    {
      title: "Expense Details",
      description: "Detailed transaction list with categories",
      icon: FileText,
      action: () => exportData('csv')
    },
    {
      title: "Budget Report",
      description: "Budget vs actual spending analysis",
      icon: TrendingUp,
      action: () => exportData('json')
    },
    {
      title: "Complete Backup",
      description: "Full data export including all settings",
      icon: Download,
      action: () => exportData('json')
    }
  ];

  return (
    <>
      <Helmet>
        <title>Reports & Export - MoneyBee</title>
        <meta name="description" content="Export your financial data and generate detailed reports" />
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
            <h1 className="text-xl font-semibold">Reports & Export</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-center py-6">
            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generate Reports</h2>
            <p className="text-muted-foreground">
              Export your financial data in various formats
            </p>
          </div>

          <div className="space-y-3">
            {reportTypes.map((report, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <report.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={report.action}
                    >
                      <Download size={16} className="mr-1" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Transactions</span>
                <span className="font-semibold">{expenses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-semibold">{accounts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget Categories</span>
                <span className="font-semibold">{budgets.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}