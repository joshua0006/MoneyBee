import { ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";
import { Helmet } from "react-helmet-async";
import { FinancialSimulation } from "@/components/FinancialSimulation";
import { useAppData } from "@/hooks/useAppData";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Growth() {
  const navigate = useNavigate();
  const { expenses, isLoading } = useAppData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <LoadingSkeleton type="card" count={1} />
          </div>
        </div>
        <div className="p-4">
          <LoadingSkeleton type="chart" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Wealth Growth - MoneyBee</title>
        <meta name="description" content="Visualize your financial future with personalized growth projections and scenarios" />
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
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Wealth Growth</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-24">
          <FinancialSimulation expenses={expenses} />
        </div>
      </div>
    </>
  );
}