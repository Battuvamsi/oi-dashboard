import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BarChart3, TrendingUp, Activity, ArrowRight } from "lucide-react";
import LtpBanner from "@/components/LtpBanner";
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
  const [ltpData, setLtpData] = useState<{ nifty: LtpData | null; banknifty: LtpData | null }>({
    nifty: null,
    banknifty: null,
  });

  const API_BASE = "http://localhost:8080";

  useEffect(() => {
    const fetchLtpData = async () => {
      try {
        const [niftyResponse, bankniftyResponse] = await Promise.all([
          fetch(`${API_BASE}/cache/ltp/256265`),
          fetch(`${API_BASE}/cache/ltp/260105`),
        ]);

        if (niftyResponse.ok && bankniftyResponse.ok) {
          const niftyData = await niftyResponse.json();
          const bankniftyData = await bankniftyResponse.json();
          setLtpData({ nifty: niftyData, banknifty: bankniftyData });
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
      className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted"
    >
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src="./logo.svg" alt="Logo" width={32} height={32} className="rounded" />
              <span className="text-xl font-bold tracking-tight">OI Change</span>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="cursor-pointer">
              Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              OI Change Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Real-time options chain analysis with open interest tracking, imbalance monitoring, and PCR calculations
            </p>
          </motion.div>

          {/* LTP Banner */}
          {ltpData.nifty && ltpData.banknifty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full"
            >
              <LtpBanner data={{ nifty: ltpData.nifty, banknifty: ltpData.banknifty }} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center"
          >
            <Button size="lg" onClick={() => navigate("/dashboard")} className="cursor-pointer">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <div className="p-6 rounded-lg border bg-card">
              <BarChart3 className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-lg font-bold tracking-tight mb-2">Live Data</h3>
              <p className="text-muted-foreground">
                Track open interest changes across multiple instruments in real-time
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <TrendingUp className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-lg font-bold tracking-tight mb-2">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Interactive graphs showing imbalance trends with detailed tooltips
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Activity className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-lg font-bold tracking-tight mb-2">Options Chain</h3>
              <p className="text-muted-foreground">
                Complete options chain view with COI, OI changes, and PCR metrics
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Powered by{" "}
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            vly.ai
          </a>
        </p>
      </footer>
    </motion.div>
  );
}