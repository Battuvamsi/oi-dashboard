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
  const badges = [
    { label: "Call OI", value: totals.callOiSum.toLocaleString(), color: "bg-green-500/90 hover:bg-green-500" },
    { label: "Put OI", value: totals.putOiSum.toLocaleString(), color: "bg-red-500/90 hover:bg-red-500" },
    { label: "Imbalance", value: totals.totalImbalance.toFixed(2), color: "bg-blue-500/90 hover:bg-blue-500" },
    { label: "PCR", value: totals.pcr.toFixed(4), color: "bg-purple-500/90 hover:bg-purple-500" },
  ];

  return (
    <Card className="p-5 bg-card/80 backdrop-blur-sm">
      <div className="flex flex-wrap gap-6">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <Badge className={`${badge.color} text-white font-semibold px-3 py-1 transition-colors`}>
              {badge.label}
            </Badge>
            <span className="text-xl font-bold text-foreground">{badge.value}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}