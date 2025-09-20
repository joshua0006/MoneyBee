import { format } from "date-fns";

interface WelcomeBannerProps {
  userName?: string;
}

export const WelcomeBanner = ({ userName = 'Saver' }: WelcomeBannerProps) => {
  return (
    <section className="mb-4 xs:mb-6">
      <div className="p-3 xs:p-4 bg-gradient-to-br from-bee-gold/5 via-background to-bee-blue/5 rounded-xl xs:rounded-2xl border border-bee-gold/20 shadow-soft mobile-card-hover">
        <div className="flex flex-col gap-2 xs:gap-3">
          <div className="flex-1">
            <h2 className="text-base xs:text-lg font-semibold text-foreground mb-0.5 xs:mb-1">
              Welcome back, {userName}! 🐝
            </h2>
            <p className="text-xs xs:text-sm text-muted-foreground mobile-text-scale">
              Let's make your money grow like a busy bee hive
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[10px] xs:text-xs text-muted-foreground">Today</div>
            <div className="text-xs xs:text-sm font-medium text-bee-blue">
              {format(new Date(), 'MMM dd')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};