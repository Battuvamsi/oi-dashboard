import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface KeysListProps {
  keys: string[];
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
}

export default function KeysList({ keys, selectedKey, onSelectKey }: KeysListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-73px)]">
      <div className="p-2 space-y-1">
        {keys.map((key, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant={selectedKey === key ? "default" : "ghost"}
              className="w-full justify-start cursor-pointer text-foreground hover:text-foreground"
              onClick={() => onSelectKey(key)}
            >
              {key}
            </Button>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}