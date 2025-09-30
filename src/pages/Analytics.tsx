import { useAppData } from "@/contexts/AppDataContext";
import { Helmet } from "react-helmet-async";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsContent } from "@/components/analytics/AnalyticsContent";

export default function Analytics() {
  const { expenses } = useAppData();

  return (
    <>
      <Helmet>
        <title>Analytics - MoneyBee</title>
        <meta name="description" content="Analyze your spending patterns and financial trends with detailed charts" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AnalyticsHeader />
        <AnalyticsContent expenses={expenses} />
      </div>
    </>
  );
}