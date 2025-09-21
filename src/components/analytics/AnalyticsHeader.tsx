import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { mobileService } from "@/utils/mobileService";

export const AnalyticsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            mobileService.lightHaptic();
            navigate(-1);
          }}
          className="p-2 hover:bg-primary/10"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">Analytics</h1>
      </div>
    </div>
  );
};