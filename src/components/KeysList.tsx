import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

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
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={selectedKey === key ? "default" : "ghost"}
                className="w-full justify-start cursor-pointer text-foreground hover:text-foreground py-1.5 sm:py-2 h-auto px-2 sm:px-3"
                onClick={() => onSelectKey(key)}
              >
                <div className="flex flex-col items-start w-full gap-0.5">
                  <span className="font-bold text-xs sm:text-sm tracking-wide">{indexName}</span>
                  {date && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{date}</span>
                  )}
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}