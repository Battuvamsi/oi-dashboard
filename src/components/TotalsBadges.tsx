import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface TotalsBadgesProps {
  totals: {
    callOiSum: number;
    putOiSum: number;
    totalImbalance: number;
    pcr: number;
  };
}

export default function TotalsBadges({ totals }: TotalsBadgesProps) {
  const getTrendInfo = () => {
    if (totals.totalImbalance >= 30) {
      return { label: "BULLISH", color: "bg-green-500/90 hover:bg-green-500" };
    } else if (totals.totalImbalance <= -30) {
      return { label: "BEARISH", color: "bg-red-500/90 hover:bg-red-500" };
    } else {
      return { label: "NEUTRAL", color: "bg-gray-500/90 hover:bg-gray-500" };
    }
  };

  const trendInfo = getTrendInfo();

  const badges = [
    { label: "Call OI", value: totals.callOiSum.toLocaleString(), color: "bg-green-500/90 hover:bg-green-500" },
    { label: "Put OI", value: totals.putOiSum.toLocaleString(), color: "bg-red-500/90 hover:bg-red-500" },
    { label: "Imbalance", value: totals.totalImbalance.toFixed(2), color: "bg-blue-500/90 hover:bg-blue-500" },
    { label: "PCR", value: totals.pcr.toFixed(4), color: "bg-purple-500/90 hover:bg-purple-500" },
    { label: "Trend", value: trendInfo.label, color: trendInfo.color },
  ];

  return (
    <Card className="p-1.5 sm:p-2 md:p-3 bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-1 sm:gap-2 md:gap-3"
          >
            <Badge className={`${badge.color} text-white font-semibold px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-xs sm:text-sm transition-colors`}>
              {badge.label}
            </Badge>
            <span className="text-sm sm:text-base md:text-xl font-bold text-foreground truncate">{badge.value}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}