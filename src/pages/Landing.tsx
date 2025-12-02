import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BarChart3, TrendingUp, Activity, ArrowRight, Sparkles, Moon, Sun } from "lucide-react";
import LtpBanner from "@/components/LtpBanner";
import TickerTapeWidget from "@/components/TickerTapeWidget";
import TradingViewWidget from "@/components/TradingViewWidget";
import { useEffect, useState } from "react";

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

export default function Landing() {
  const navigate = useNavigate();
  const [ltpData, setLtpData] = useState<{ nifty: LtpData | null; banknifty: LtpData | null; sensex: LtpData | null }>({
    nifty: null,
    banknifty: null,
    sensex: null,
  });
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const API_BASE = "https://ticker.pollenprints.in";

  useEffect(() => {
    // Default to dark mode on mount
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const fetchLtpData = async () => {
      try {
        const [niftyResponse, bankniftyResponse, sensexResponse] = await Promise.all([
          fetch(`${API_BASE}/cache/ltp/256265`),
          fetch(`${API_BASE}/cache/ltp/260105`),
          fetch(`${API_BASE}/cache/ltp/265`),
        ]);

        if (niftyResponse.ok && bankniftyResponse.ok && sensexResponse.ok) {
          const niftyData = await niftyResponse.json();
          const bankniftyData = await bankniftyResponse.json();
          const sensexData = await sensexResponse.json();
          setLtpData({ nifty: niftyData, banknifty: bankniftyData, sensex: sensexData });
        }
      } catch (error) {
        console.error("Error fetching LTP data:", error);
      }
    };

    fetchLtpData();
    const interval = setInterval(fetchLtpData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 gap-1 sm:gap-2">
            <motion.div 
              className="flex items-center gap-1 sm:gap-2 cursor-pointer min-w-0 flex-shrink" 
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src="./logo.svg" alt="Logo" width={32} height={32} className="rounded-lg flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9" />
              <span className="text-base sm:text-base md:text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">OI Change</span>
            </motion.div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <Button onClick={toggleTheme} variant="outline" size="icon" className="cursor-pointer h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={() => navigate("/login")} variant="outline" className="cursor-pointer text-white hover:text-white text-xs px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 h-7 sm:h-8 md:h-10">
                Login
              </Button>
              <Button onClick={() => navigate("/dashboard")} className="cursor-pointer shadow-lg text-xs px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 h-7 sm:h-8 md:h-10 gap-0.5 sm:gap-1">
                <span className="hidden md:inline">Open Dashboard</span>
                <span className="md:hidden">Dashboard</span>
                <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ticker Tape Widget */}
      <div className="w-full z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TickerTapeWidget />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-3 sm:py-4 md:py-8 relative overflow-hidden">
        {/* Background candlestick chart image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80')",
            filter: "blur(2px)"
          }}
        />
        <div className="max-w-6xl mx-auto text-center space-y-3 sm:space-y-4 md:space-y-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 sm:space-y-2 md:space-y-4"
          >
            <div className="inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full bg-primary/10 border border-primary/20 mb-1 sm:mb-2 md:mb-4">
              <Sparkles className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
              <span className="text-[11px] sm:text-sm font-semibold text-primary">Real-time Market Intelligence</span>
            </div>
            <h1 className="text-5xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-2 sm:mb-3 md:mb-6 bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight">
              OI Change Dashboard
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-1">
              Real-time options chain analysis with open interest tracking, imbalance monitoring, and PCR calculations
            </p>
          </motion.div>

          {/* TradingView Widget Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 px-2 sm:px-0"
          >
            <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm h-[200px] sm:h-[250px] md:h-[300px]">
              <TradingViewWidget symbol="BITSTAMP:BTCUSD" />
            </div>
          </motion.div>

          {/* LTP Banner - with OHLC */}
          {ltpData.nifty && ltpData.banknifty && ltpData.sensex && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full px-0"
            >
              <LtpBanner data={{ nifty: ltpData.nifty, banknifty: ltpData.banknifty, sensex: ltpData.sensex }} showOHLC={true} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 sm:gap-2 md:gap-4 justify-center px-2 sm:px-1"
          >
            <Button size="sm" onClick={() => navigate("/dashboard")} className="cursor-pointer shadow-xl text-sm sm:text-sm md:text-base px-6 sm:px-6 md:px-8 py-2 sm:py-2 md:py-2.5 h-auto">
              Get Started <ArrowRight className="ml-1 sm:ml-1 md:ml-2 h-4 w-4 sm:h-3 sm:w-3 md:h-5 md:w-5" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3 md:gap-6 mt-6 sm:mt-10 md:mt-20 px-2 sm:px-1"
          >
            {[
              {
                icon: BarChart3,
                title: "Live Data",
                description: "Track open interest changes across multiple instruments in real-time",
                color: "text-blue-500"
              },
              {
                icon: TrendingUp,
                title: "Visual Analytics",
                description: "Interactive graphs showing imbalance trends with detailed tooltips",
                color: "text-green-500"
              },
              {
                icon: Activity,
                title: "Options Chain",
                description: "Complete options chain view with COI, OI changes, and PCR metrics",
                color: "text-purple-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-2 sm:p-3 md:p-6 lg:p-8 rounded-lg md:rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg"
              >
                <div className={`inline-flex p-1.5 sm:p-2 md:p-3 rounded-lg bg-primary/10 mb-1.5 sm:mb-2 md:mb-4 ${feature.color}`}>
                  <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-8 md:w-8" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight mb-1 sm:mb-2 md:mb-3 text-foreground">{feature.title}</h3>
                <p className="text-xs sm:text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 sm:py-6 md:py-8 text-center text-xs sm:text-sm text-muted-foreground bg-card/30 backdrop-blur-sm">
        <p className="text-xs sm:text-sm md:text-base">
          Powered by{" "}
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-primary transition-colors"
          >
            vly.ai
          </a>
        </p>
      </footer>
    </motion.div>
  );
}