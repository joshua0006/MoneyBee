import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarView } from "@/components/CalendarView";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";

export default function Calendar() {
  const navigate = useNavigate();
  const { expenses, budgets, accounts } = useAppData();
  
  // Mock goals data (in a real app, this would come from the database)
  const goals = [
    {
      id: '1',
      title: 'Emergency Fund',
      target: 5000,
      current: 2500,
      category: 'savings',
      deadline: new Date('2024-12-31'),
      description: 'Build a 6-month emergency fund'
    },
    {
      id: '2',
      title: 'Vacation Fund',
      target: 2000,
      current: 800,
      category: 'travel',
      deadline: new Date('2024-08-15'),
      description: 'Save for summer vacation'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Calendar - MoneyBee</title>
        <meta name="description" content="View your expenses and income organized by calendar date" />
      </Helmet>
      
      <div className="h-screen overflow-y-auto bg-background">
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
            <h1 className="text-xl font-semibold">Calendar</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-24">
          <CalendarView 
            expenses={expenses}
            budgets={budgets}
            accounts={accounts}
            goals={goals}
            onDateSelect={() => {}}
          />
        </div>
      </div>
    </>
  );
}