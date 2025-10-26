import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";

interface KeysListProps {
  keys: string[];
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
}

export default function KeysList({ keys, selectedKey, onSelectKey }: KeysListProps) {
  // Function to parse and format the key
  const formatKey = (key: string) => {
    // Extract index name and date (e.g., "NIFTY_2024-01-15" -> ["NIFTY", "2024-01-15"])
    const parts = key.split('_');
    if (parts.length >= 2) {
      const index = parts[0];
      const dateStr = parts[1];
      
      // Format date if it exists
      if (dateStr) {
        const dateParts = dateStr.split('-');
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
          return { index, date: formattedDate };
        }
      }
    }
    // Fallback to original key if parsing fails
    return { index: key, date: null };
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-1 sm:p-1.5 md:p-2 space-y-0.5 sm:space-y-1">
        {keys.map((key, index) => {
          const { index: indexName, date } = formatKey(key);
          const isSelected = selectedKey === key;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={isSelected ? "default" : "ghost"}
                className={`w-full justify-start cursor-pointer py-2 sm:py-2.5 h-auto px-2 sm:px-3 transition-all duration-200 ${
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-primary/10 hover:border-primary/30 border border-transparent"
                }`}
                onClick={() => onSelectKey(key)}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                  <div className={`p-1 sm:p-1.5 rounded ${isSelected ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
                    <TrendingUp className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className={`font-bold text-xs sm:text-sm tracking-wide ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                      {indexName}
                    </span>
                    {date && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
                        <span className={`text-[10px] sm:text-xs font-medium ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}