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

  // Function to get color based on instrument type
  const getInstrumentColor = (indexName: string) => {
    const upperIndex = indexName.toUpperCase();
    if (upperIndex.includes('BANKNIFTY')) {
      return {
        bg: 'bg-purple-500/10',
        bgSelected: 'bg-purple-500',
        border: 'border-purple-500/30',
        text: 'text-purple-600 dark:text-purple-400',
        textSelected: 'text-white',
      };
    } else if (upperIndex.includes('SENSEX')) {
      return {
        bg: 'bg-green-500/10',
        bgSelected: 'bg-green-500',
        border: 'border-green-500/30',
        text: 'text-green-600 dark:text-green-400',
        textSelected: 'text-white',
      };
    }
    // Default color for other instruments
    return {
      bg: 'bg-primary/10',
      bgSelected: 'bg-primary',
      border: 'border-primary/30',
      text: 'text-primary',
      textSelected: 'text-primary-foreground',
    };
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-1.5 space-y-1">
        {keys.map((key, index) => {
          const { index: indexName, date } = formatKey(key);
          const isSelected = selectedKey === key;
          const colors = getInstrumentColor(indexName);
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={isSelected ? "default" : "ghost"}
                className={`w-full justify-start cursor-pointer py-2 h-auto px-2.5 transition-all duration-200 ${
                  isSelected 
                    ? `${colors.bgSelected} ${colors.textSelected} shadow-md` 
                    : `hover:${colors.bg} hover:${colors.border} border border-transparent ${colors.bg}`
                }`}
                onClick={() => onSelectKey(key)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`p-1.5 rounded ${isSelected ? 'bg-white/20' : colors.bg}`}>
                    <TrendingUp className={`h-2.5 w-2.5 ${isSelected ? colors.textSelected : colors.text}`} />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className={`font-bold text-[10px] tracking-wide ${isSelected ? colors.textSelected : colors.text}`}>
                      {indexName}
                    </span>
                    {date && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Calendar className={`h-2 w-2 ${isSelected ? `${colors.textSelected} opacity-70` : 'text-muted-foreground'}`} />
                        <span className={`text-[9px] font-medium ${isSelected ? `${colors.textSelected} opacity-80` : 'text-muted-foreground'}`}>
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