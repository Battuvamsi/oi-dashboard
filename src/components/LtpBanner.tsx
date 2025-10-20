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
  };
  showOHLC?: boolean;
}

const InstrumentCard = ({ label, data, showOHLC = false }: { label: string; data: LtpData; showOHLC?: boolean }) => {
  const difference = data.ltp - data.close;
  const changePercentage = data.change;
  const isPositive = difference >= 0;

  return (
    <div className="flex-1 p-2 sm:p-2.5 rounded-md border border-primary/30 bg-gradient-to-br from-primary/5 to-card/70 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${showOHLC ? "md:flex-row md:items-start md:justify-between" : "flex-col"} gap-1 sm:gap-1.5`}
      >
        <div className="flex flex-col gap-1 sm:gap-1.5 flex-1">
          <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{data.ltp.toFixed(2)}</span>
            <div className={`flex items-center gap-0.5 text-xs sm:text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>
                {isPositive ? "+" : ""}{difference.toFixed(2)}
              </span>
            </div>
          </div>
          <div className={`text-[10px] sm:text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{changePercentage.toFixed(2)}%
          </div>
        </div>
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

export default function LtpBanner({ data, showOHLC = false }: LtpBannerProps) {
  return (
    <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full md:max-w-2xl lg:max-w-3xl mx-auto justify-center">
      <InstrumentCard label="NIFTY" data={data.nifty} showOHLC={showOHLC} />
      <InstrumentCard label="BANKNIFTY" data={data.banknifty} showOHLC={showOHLC} />
    </div>
  );
}