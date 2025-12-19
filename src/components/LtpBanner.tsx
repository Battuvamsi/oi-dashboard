import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface LtpData {
  instrumentToken: number;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  lastTradedQuantity: number;
  averageTradePrice: number;
  volumeTradedToday: number;
  oi: number;
  openInterestDayHigh: number;
  openInterestDayLow: number;
}

interface LtpBannerProps {
  data: {
    nifty: LtpData;
    banknifty: LtpData;
    sensex: LtpData;
  };
  showOHLC?: boolean;
  compact?: boolean;
}

const InstrumentCard = ({ label, data, showOHLC = false, compact = false }: { label: string; data: LtpData; showOHLC?: boolean; compact?: boolean }) => {
  const difference = data.ltp - data.close;
  const changePercentage = data.change;
  const isPositive = difference >= 0;

  return (
    <div className={`flex-1 ${compact ? 'p-0.5 sm:p-1' : 'p-2 sm:p-2.5'} rounded-md border ${isPositive ? "border-green-500/40 dark:border-green-500/20 bg-gradient-to-br from-green-500/25 to-green-500/5 dark:from-green-500/10 dark:to-card/40" : "border-red-500/40 dark:border-red-500/20 bg-gradient-to-br from-red-500/25 to-red-500/5 dark:from-red-500/10 dark:to-card/40"} backdrop-blur-sm hover:bg-card/60 transition-all duration-300`}>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${showOHLC ? "md:flex-row md:items-start md:justify-between" : "flex-col"} ${compact ? 'gap-0' : 'gap-1 sm:gap-1.5'}`}
      >
        {compact ? (
          <div className="flex flex-row items-center justify-between w-full gap-1 sm:gap-2 px-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wide">{label}</div>
              <span className="text-sm sm:text-base font-bold text-foreground">{data.ltp.toFixed(2)}</span>
            </div>
            <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              <span>{isPositive ? "+" : ""}{difference.toFixed(2)}</span>
              <span className="hidden sm:inline">({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)</span>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col ${compact ? 'gap-0 sm:gap-0.5' : 'gap-1 sm:gap-1.5'} flex-1`}>
            <div className={`${compact ? 'text-[8px] sm:text-[9px]' : 'text-[10px] sm:text-xs'} font-semibold text-muted-foreground uppercase tracking-wide`}>
              {label}
            </div>
            <div className={`flex items-baseline ${compact ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-1.5'}`}>
              <span className={`${compact ? 'text-lg sm:text-xl md:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold text-foreground`}>{data.ltp.toFixed(2)}</span>
              <div className={`flex items-center gap-0.5 ${compact ? 'text-[9px] sm:text-[10px]' : 'text-xs sm:text-sm'} font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <TrendingUp className={compact ? "h-2 w-2" : "h-3 w-3"} /> : <TrendingDown className={compact ? "h-2 w-2" : "h-3 w-3"} />}
                <span>
                  {isPositive ? "+" : ""}{difference.toFixed(2)}
                </span>
                {compact && (
                  <span className="ml-0.5">
                    ({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>
            {!compact && (
              <div className={`${compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'} font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}{changePercentage.toFixed(2)}%
              </div>
            )}
          </div>
        )}
        {showOHLC && (
          <div className="hidden md:flex flex-col gap-1 text-right">
            <div>
              <p className="text-muted-foreground font-semibold text-[8px]">O</p>
              <p className="font-bold text-foreground text-[10px]">{data.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-[8px]">H</p>
              <p className="font-bold text-green-400 text-[10px]">{data.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-[8px]">L</p>
              <p className="font-bold text-red-400 text-[10px]">{data.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold text-[8px]">C</p>
              <p className="font-bold text-foreground text-[10px]">{data.close.toFixed(2)}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function LtpBanner({ data, showOHLC = false, compact = false }: LtpBannerProps) {
  return (
    <div className={`flex ${compact ? 'gap-1 sm:gap-2' : 'gap-2 sm:gap-3 md:gap-4 lg:gap-6'} w-full ${compact ? 'max-w-full' : 'md:max-w-3xl lg:max-w-5xl'} mx-auto justify-center`}>
      <InstrumentCard label="NIFTY" data={data.nifty} showOHLC={showOHLC} compact={compact} />
      <InstrumentCard label="BANKNIFTY" data={data.banknifty} showOHLC={showOHLC} compact={compact} />
      <InstrumentCard label="SENSEX" data={data.sensex} showOHLC={showOHLC} compact={compact} />
    </div>
  );
}