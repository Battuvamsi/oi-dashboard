import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BarChart3, TrendingUp, Activity, ArrowRight, Sparkles } from "lucide-react";
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
      className="dark min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src="./logo.svg" alt="Logo" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">OI Change</span>
            </motion.div>
            <Button onClick={() => navigate("/dashboard")} className="cursor-pointer shadow-lg" size="lg">
              Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-6xl mx-auto text-center space-y-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Real-time Market Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              OI Change Dashboard
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
            <Button size="lg" onClick={() => navigate("/dashboard")} className="cursor-pointer shadow-xl text-base px-8 py-6">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
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
                className="p-8 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg"
              >
                <div className={`inline-flex p-3 rounded-lg bg-primary/10 mb-4 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-card/30 backdrop-blur-sm">
        <p className="text-base">
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