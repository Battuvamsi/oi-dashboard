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
    <div className="flex-1 min-w-[300px]">
      <div className="mb-3">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">LTP</p>
            <p className="text-2xl font-bold tracking-tight">{data.ltp.toFixed(2)}</p>
          </div>
          
          <div className={`flex items-center gap-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <div>
              <p className="text-xl font-bold">
                {isPositive ? "+" : ""}{difference.toFixed(2)}
              </p>
              <p className="text-xs font-semibold">
                ({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-xs">
          <div>
            <p className="text-muted-foreground">Open</p>
            <p className="font-semibold">{data.open.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">High</p>
            <p className="font-semibold text-green-600">{data.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Low</p>
            <p className="font-semibold text-red-600">{data.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Close</p>
            <p className="font-semibold">{data.close.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LtpBanner({ data }: LtpBannerProps) {
  return (
    <Card className="p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6 divide-y lg:divide-y-0 lg:divide-x"
      >
        <InstrumentCard label="NIFTY" data={data.nifty} />
        <div className="lg:pl-6 pt-6 lg:pt-0">
          <InstrumentCard label="BANKNIFTY" data={data.banknifty} />
        </div>
      </motion.div>
    </Card>
  );
}
