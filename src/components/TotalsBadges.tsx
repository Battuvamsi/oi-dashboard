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
    { label: "Call OI", value: totals.callOiSum.toLocaleString(), color: "bg-green-500" },
    { label: "Put OI", value: totals.putOiSum.toLocaleString(), color: "bg-red-500" },
    { label: "Imbalance", value: totals.totalImbalance.toFixed(2), color: "bg-blue-500" },
    { label: "PCR", value: totals.pcr.toFixed(4), color: "bg-purple-500" },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-4">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <Badge className={`${badge.color} text-white`}>
              {badge.label}
            </Badge>
            <span className="text-lg font-semibold">{badge.value}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
