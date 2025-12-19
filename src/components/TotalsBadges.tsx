import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TotalsBadgesProps {
  totals: {
    callOiSum: number;
    putOiSum: number;
    totalImbalance: number;
    pcr: number;
  };
  isSticky?: boolean;
  onToggleSticky?: (checked: boolean) => void;
}

export default function TotalsBadges({ totals, isSticky, onToggleSticky }: TotalsBadgesProps) {
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
    <Card className="p-1 sm:p-1.5 md:p-2 bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 items-center">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-1 sm:gap-1.5 md:gap-2"
          >
            <Badge className={`${badge.color} text-white font-semibold px-1 sm:px-1.5 md:px-2 py-0 sm:py-0.5 text-[10px] sm:text-xs transition-colors`}>
              {badge.label}
            </Badge>
            <span className="text-xs sm:text-sm md:text-base font-bold text-foreground truncate">{badge.value}</span>
          </motion.div>
        ))}
        
        {onToggleSticky && (
          <div className="flex items-center gap-2 border-l border-border/50 pl-2 ml-auto">
            <Checkbox 
              id="header-sticky-mode" 
              checked={isSticky} 
              onCheckedChange={(checked) => onToggleSticky(checked as boolean)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor="header-sticky-mode" className="text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors">Sticky Header</Label>
          </div>
        )}
      </div>
    </Card>
  );
}