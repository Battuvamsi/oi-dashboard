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
}

const InstrumentCard = ({ label, data }: { label: string; data: LtpData }) => {
  const difference = data.ltp - data.close;
  const changePercentage = data.change;
  const isPositive = difference >= 0;

  return (
    <div className="flex items-center justify-between gap-4 flex-1">
      <div className="flex items-center gap-3">
        <div className="text-sm font-bold text-foreground uppercase tracking-wider min-w-[90px]">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{data.ltp.toFixed(2)}</span>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isPositive ? "+" : ""}{difference.toFixed(2)} ({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-1">O</p>
          <p className="font-semibold text-foreground">{data.open.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-1">H</p>
          <p className="font-semibold text-green-400">{data.high.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-1">L</p>
          <p className="font-semibold text-red-400">{data.low.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground font-medium mb-1">C</p>
          <p className="font-semibold text-foreground">{data.close.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default function LtpBanner({ data }: LtpBannerProps) {
  return (
    <Card className="p-5 border-primary/30 bg-card/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6 divide-y lg:divide-y-0 lg:divide-x divide-border"
      >
        <InstrumentCard label="NIFTY" data={data.nifty} />
        <div className="lg:pl-6 pt-6 lg:pt-0">
          <InstrumentCard label="BANKNIFTY" data={data.banknifty} />
        </div>
      </motion.div>
    </Card>
  );
}