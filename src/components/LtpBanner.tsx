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
  data: LtpData;
}

export default function LtpBanner({ data }: LtpBannerProps) {
  const difference = data.ltp - data.close;
  const changePercentage = data.change;
  const isPositive = difference >= 0;

  return (
    <Card className="p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Traded Price</p>
            <p className="text-3xl font-bold tracking-tight">{data.ltp.toFixed(2)}</p>
          </div>
          
          <div className={`flex items-center gap-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? (
              <TrendingUp className="h-6 w-6" />
            ) : (
              <TrendingDown className="h-6 w-6" />
            )}
            <div>
              <p className="text-2xl font-bold">
                {isPositive ? "+" : ""}{difference.toFixed(2)}
              </p>
              <p className="text-sm font-semibold">
                ({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 text-sm">
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
      </motion.div>
    </Card>
  );
}
