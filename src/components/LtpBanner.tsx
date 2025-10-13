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
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider min-w-[80px]">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{data.ltp.toFixed(2)}</span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="font-semibold">
              {isPositive ? "+" : ""}{difference.toFixed(2)} ({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 text-xs">
        <div className="text-center">
          <p className="text-muted-foreground">O</p>
          <p className="font-semibold">{data.open.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">H</p>
          <p className="font-semibold text-green-500">{data.high.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">L</p>
          <p className="font-semibold text-red-500">{data.low.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">C</p>
          <p className="font-semibold">{data.close.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default function LtpBanner({ data }: LtpBannerProps) {
  return (
    <Card className="p-4 border-primary/20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 divide-y lg:divide-y-0 lg:divide-x divide-border/50"
      >
        <InstrumentCard label="NIFTY" data={data.nifty} />
        <div className="lg:pl-4 pt-4 lg:pt-0">
          <InstrumentCard label="BANKNIFTY" data={data.banknifty} />
        </div>
      </motion.div>
    </Card>
  );
}