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
  selectedKey?: string | null;
}

const InstrumentCard = ({ 
  label, 
  data, 
  showOHLC = false, 
  compact = false,
  isSelected = false 
}: { 
  label: string; 
  data: LtpData; 
  showOHLC?: boolean; 
  compact?: boolean;
  isSelected?: boolean;
}) => {
  const difference = data.ltp - data.close;
  const isPositive = difference >= 0;
  const changePercentage = data.change;

  return (
    <div className={`flex-1 ${compact ? 'p-1 sm:p-2' : 'p-2 sm:p-2.5'} rounded-lg border ${
      isPositive 
        ? "border-green-500/40 dark:border-green-500/20 bg-gradient-to-br from-green-500/25 to-green-500/5 dark:from-green-500/10 dark:to-card/40" 
        : "border-red-500/40 dark:border-red-500/20 bg-gradient-to-br from-red-500/25 to-red-500/5 dark:from-red-500/10 dark:to-card/40"
      } backdrop-blur-sm transition-all duration-300 ${
        isSelected 
          ? `ring-1 ${isPositive ? "ring-green-500 border-green-500 shadow-[0_0_30px_-5px_rgba(34,197,94,0.6)]" : "ring-red-500 border-red-500 shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)]"} scale-[1.05] z-10 bg-background/95 dark:bg-background/80 -translate-y-1`
          : "opacity-90 hover:opacity-100 hover:bg-card/60 hover:scale-[1.01]"
      }`}>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${showOHLC ? "md:flex-row md:items-start md:justify-between" : "flex-col"} ${compact ? 'gap-0' : 'gap-1 sm:gap-1.5'}`}
      >
        {compact ? (
          <div className="flex flex-row items-center justify-between w-full gap-1 sm:gap-2 px-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`text-sm sm:text-base font-bold uppercase tracking-wide ${isPositive ? "text-green-900 dark:text-muted-foreground" : "text-red-900 dark:text-muted-foreground"}`}>{label}</div>
              <span className="text-lg sm:text-xl font-bold text-foreground">{data.ltp.toFixed(2)}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${isPositive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              <span>{isPositive ? "+" : ""}{difference.toFixed(2)}</span>
              <span className="hidden sm:inline">({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)</span>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col ${compact ? 'gap-0 sm:gap-0.5' : 'gap-1 sm:gap-1.5'} flex-1`}>
            <div className={`${compact ? 'text-[8px] sm:text-[9px]' : 'text-[10px] sm:text-xs'} font-semibold uppercase tracking-wide ${isPositive ? "text-green-900 dark:text-muted-foreground" : "text-red-900 dark:text-muted-foreground"}`}>
              {label}
            </div>
            <div className={`flex items-baseline ${compact ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-1.5'}`}>
              <span className={`${compact ? 'text-lg sm:text-xl md:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold text-foreground`}>{data.ltp.toFixed(2)}</span>
              <div className={`flex items-center gap-0.5 ${compact ? 'text-[9px] sm:text-[10px]' : 'text-xs sm:text-sm'} font-semibold ${isPositive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
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
              <div className={`${compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'} font-semibold ${isPositive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {isPositive ? "+" : ""}{changePercentage.toFixed(2)}%
              </div>
            )}
          </div>
        )}
        {showOHLC && (
          <div className="hidden md:flex flex-col gap-1 text-right">
            <div>
              <p className={`font-semibold text-[8px] ${isPositive ? "text-green-900/70 dark:text-muted-foreground" : "text-red-900/70 dark:text-muted-foreground"}`}>O</p>
              <p className="font-bold text-foreground text-[10px]">{data.open.toFixed(2)}</p>
            </div>
            <div>
              <p className={`font-semibold text-[8px] ${isPositive ? "text-green-900/70 dark:text-muted-foreground" : "text-red-900/70 dark:text-muted-foreground"}`}>H</p>
              <p className="font-bold text-green-700 dark:text-green-400 text-[10px]">{data.high.toFixed(2)}</p>
            </div>
            <div>
              <p className={`font-semibold text-[8px] ${isPositive ? "text-green-900/70 dark:text-muted-foreground" : "text-red-900/70 dark:text-muted-foreground"}`}>L</p>
              <p className="font-bold text-red-700 dark:text-red-400 text-[10px]">{data.low.toFixed(2)}</p>
            </div>
            <div>
              <p className={`font-semibold text-[8px] ${isPositive ? "text-green-900/70 dark:text-muted-foreground" : "text-red-900/70 dark:text-muted-foreground"}`}>C</p>
              <p className="font-bold text-foreground text-[10px]">{data.close.toFixed(2)}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function LtpBanner({ data, showOHLC = false, compact = false, selectedKey }: LtpBannerProps) {
  const checkSelected = (label: string) => {
    if (!selectedKey) return false;
    return selectedKey.toUpperCase().startsWith(label);
  };

  return (
    <div className={`flex ${compact ? 'gap-1 sm:gap-2' : 'gap-2 sm:gap-3 md:gap-4 lg:gap-6'} w-full ${compact ? 'max-w-full' : 'md:max-w-3xl lg:max-w-5xl'} mx-auto justify-center`}>
      <InstrumentCard 
        label="NIFTY" 
        data={data.nifty} 
        showOHLC={showOHLC} 
        compact={compact} 
        isSelected={checkSelected("NIFTY")}
      />
      <InstrumentCard 
        label="BANKNIFTY" 
        data={data.banknifty} 
        showOHLC={showOHLC} 
        compact={compact} 
        isSelected={checkSelected("BANKNIFTY")}
      />
      <InstrumentCard 
        label="SENSEX" 
        data={data.sensex} 
        showOHLC={showOHLC} 
        compact={compact} 
        isSelected={checkSelected("SENSEX")}
      />
    </div>
  );
}