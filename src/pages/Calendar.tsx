import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarView } from "@/components/CalendarView";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/hooks/useAppData";
import { Helmet } from "react-helmet-async";

export default function Calendar() {
  const navigate = useNavigate();
  const { expenses } = useAppData();

  return (
    <>
      <Helmet>
        <title>Calendar - MoneyBee</title>
        <meta name="description" content="View your expenses and income organized by calendar date" />
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
            <h1 className="text-xl font-semibold">Calendar</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <CalendarView 
            expenses={expenses}
            onDateSelect={() => {}}
          />
        </div>
      </div>
    </>
  );
}