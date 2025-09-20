import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { mobileService } from "@/utils/mobileService";
import { useAppData } from "@/hooks/useAppData";
import { Helmet } from "react-helmet-async";

export default function Analytics() {
  const navigate = useNavigate();
  const { expenses } = useAppData();

  return (
    <>
      <Helmet>
        <title>Analytics - MoneyBee</title>
        <meta name="description" content="Analyze your spending patterns and financial trends with detailed charts" />
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
            <h1 className="text-xl font-semibold">Analytics</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-20 space-y-6">
          <CategoryBreakdown expenses={expenses} />
          <AdvancedAnalytics expenses={expenses} />
        </div>
      </div>
    </>
  );
}