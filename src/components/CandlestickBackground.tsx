import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Candle {
  id: number;
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  isGreen: boolean;
}

export default function CandlestickBackground() {
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    const numCandles = 12;
    let currentIndex = 0;

    // Function to generate a new candle
    const generateCandle = (id: number, x: number): Candle => {
      const basePrice = 30 + Math.random() * 40;
      const volatility = 15 + Math.random() * 25;
      const open = basePrice;
      const close = open + (Math.random() - 0.5) * volatility * 2;
      const high = Math.max(open, close) + Math.random() * volatility;
      const low = Math.min(open, close) - Math.random() * volatility;
      
      return {
        id,
        x,
        open,
        close,
        high,
        low,
        isGreen: close > open,
      };
    };

    // Sequentially add candles from left to right
    const addCandleInterval = setInterval(() => {
      if (currentIndex < numCandles) {
        const x = (currentIndex / (numCandles - 1)) * 100;
        const newCandle = generateCandle(currentIndex, x);
        
        setCandles((prev) => [...prev, newCandle]);
        currentIndex++;
      } else {
        clearInterval(addCandleInterval);
      }
    }, 100); // Add a new candle every 100ms

    // Update existing candles with new values
    const updateInterval = setInterval(() => {
      setCandles((prev) =>
        prev.map((candle) => {
          const basePrice = 30 + Math.random() * 40;
          const volatility = 15 + Math.random() * 25;
          const open = basePrice;
          const close = open + (Math.random() - 0.5) * volatility * 2;
          const high = Math.max(open, close) + Math.random() * volatility;
          const low = Math.min(open, close) - Math.random() * volatility;
          
          return {
            ...candle,
            open,
            close,
            high,
            low,
            isGreen: close > open,
          };
        })
      );
    }, 2500);

    return () => {
      clearInterval(addCandleInterval);
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-[200px] sm:h-[250px] overflow-hidden opacity-25 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {candles.map((candle) => (
          <motion.g
            key={candle.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Body (open-close rectangle) */}
            <motion.rect
              x={candle.x - 5}
              y={100 - Math.max(candle.open, candle.close)}
              width="10"
              height={Math.max(Math.abs(candle.close - candle.open), 2)}
              fill={candle.isGreen ? "#22c55e" : "#ef4444"}
              rx="0.5"
              animate={{
                y: 100 - Math.max(candle.open, candle.close),
                height: Math.max(Math.abs(candle.close - candle.open), 2),
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}