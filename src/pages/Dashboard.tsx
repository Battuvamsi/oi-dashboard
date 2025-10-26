import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, ChevronDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import KeysList from "@/components/KeysList";
import TotalsBadges from "@/components/TotalsBadges";
import OiTable from "@/components/OiTable";
import Graph from "@/components/Graph";
import LtpBanner from "@/components/LtpBanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface OiChangeTotalValues {
  callOiSum: number;
  callChangeOiSum: number;
  callOiTotalVolume: number;
  putOiChangeSum: number;
  putOiSum: number;
  putOiTotalVolume: number;
  callCoiPercentage: number;
  putCoiPercentage: number;
  totalImbalance: number;
  pcr: number;
}

interface FilteredResult {
  strikePrice: number;
  callCoi: number;
  putCoi: number;
  imbalance: number;
  pcr: number;
  pe?: {
    oi: number;
    oiChange: number;
    ltp: number;
  };
  ce?: {
    oi: number;
    oiChange: number;
    ltp: number;
  };
}

interface OiChangeData {
  key: string;
  oiChangeTotalValues: OiChangeTotalValues;
  filteredResults: FilteredResult[];
}

interface GraphDataPoint {
  dateTime: string;
  oichangeFinalResult: {
    oiChangeTotalValues: {
      totalImbalance: number;
      pcr?: number;
    };
  };
}

interface GraphData {
  key: string;
  values: GraphDataPoint[];
}

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

export default function Dashboard() {
  const [keys, setKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [oiChangeData, setOiChangeData] = useState<OiChangeData | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [ltpData, setLtpData] = useState<{ nifty: LtpData | null; banknifty: LtpData | null }>({
    nifty: null,
    banknifty: null,
  });
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const API_BASE = "https://ticker.pollenprints.in";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    // Default to dark mode on mount
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Add authentication check
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please log in to access the dashboard");
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "user") {
      toast.error("Access denied. User privileges required.");
      window.location.href = "/login";
    }
  }, []);

  // Fetch keys on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(`${API_BASE}/cache/keys`);
        if (!response.ok) throw new Error("Failed to fetch keys");
        const data = await response.json();
        
        // Get current date in IST (UTC+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);
        const istYear = istNow.getUTCFullYear();
        const istMonth = istNow.getUTCMonth();
        const istDate = istNow.getUTCDate();
        
        const filteredKeys = data.filter((key: string) => {
          // Extract date from key (assuming format like "NIFTY_2024-01-15" or similar)
          const dateMatch = key.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            const keyYear = parseInt(dateMatch[1], 10);
            const keyMonth = parseInt(dateMatch[2], 10) - 1; // Month is 0-indexed
            const keyDay = parseInt(dateMatch[3], 10);
            
            // Compare year, month, and day
            if (keyYear > istYear) return true;
            if (keyYear < istYear) return false;
            if (keyMonth > istMonth) return true;
            if (keyMonth < istMonth) return false;
            return keyDay >= istDate;
          }
          // If no date found in key, include it by default
          return true;
        });
        
        setKeys(filteredKeys);
        if (filteredKeys.length > 0) {
          setSelectedKey(filteredKeys[0]);
        }
      } catch (error) {
        console.error("Error fetching keys:", error);
        toast.error("Failed to load keys");
      } finally {
        setLoadingKeys(false);
      }
    };

    fetchKeys();
  }, []);

  // Fetch data when selected key changes
  useEffect(() => {
    if (!selectedKey) return;

    const fetchOiData = async () => {
      try {
        const response = await fetch(`${API_BASE}/cache/getOiChange/${selectedKey}`);
        if (!response.ok) throw new Error("Failed to fetch OI data");
        const data = await response.json();
        setOiChangeData(data);
      } catch (error) {
        console.error("Error fetching OI data:", error);
        toast.error("Failed to load OI data");
      }
    };

    const fetchGraphData = async () => {
      try {
        const response = await fetch(`${API_BASE}/cache/graph/${selectedKey}`);
        if (!response.ok) throw new Error("Failed to fetch graph data");
        const data = await response.json();
        setGraphData(data);
      } catch (error) {
        console.error("Error fetching graph data:", error);
        toast.error("Failed to load graph data");
      }
    };

    const fetchLtpData = async () => {
      try {
        const [niftyResponse, bankniftyResponse] = await Promise.all([
          fetch(`${API_BASE}/cache/ltp/256265`),
          fetch(`${API_BASE}/cache/ltp/260105`),
        ]);

        if (niftyResponse.ok && bankniftyResponse.ok) {
          const niftyData = await niftyResponse.json();
          const bankniftyData = await bankniftyResponse.json();
          setLtpData({
            nifty: niftyData,
            banknifty: bankniftyData,
          });
        }
      } catch (error) {
        console.error("Error fetching LTP data:", error);
      }
    };

    // Initial fetch with loading state
    const initialFetch = async () => {
      setLoadingData(true);
      try {
        await Promise.all([fetchOiData(), fetchGraphData(), fetchLtpData()]);
      } finally {
        setLoadingData(false);
      }
    };

    initialFetch();

    // Set up intervals for each data type
    const ltpInterval = setInterval(fetchLtpData, 3000); // Every 3 seconds
    const oiInterval = setInterval(fetchOiData, 5000); // Every 5 seconds
    const graphInterval = setInterval(fetchGraphData, 60000); // Every 1 minute

    return () => {
      clearInterval(ltpInterval);
      clearInterval(oiInterval);
      clearInterval(graphInterval);
    };
  }, [selectedKey]);

  if (loadingKeys) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
    >
      <div className="flex h-screen flex-col lg:flex-row overflow-hidden">
        {/* Mobile Dropdown for Keys */}
        <div className="lg:hidden w-full p-2 sm:p-3 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between gap-2">
          <Select value={selectedKey || ""} onValueChange={setSelectedKey}>
            <SelectTrigger className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Select an instrument">
                {selectedKey && <span className="text-foreground font-medium">{selectedKey}</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {keys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="cursor-pointer flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 flex-shrink-0 p-0"
          >
            {theme === "dark" ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="cursor-pointer flex items-center justify-center gap-1 text-white hover:text-white text-xs py-1 h-8 sm:h-9 flex-shrink-0"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Left Pane - Keys List (Desktop only) */}
        <div className="hidden lg:flex lg:w-56 border-b lg:border-b-0 lg:border-r bg-card/80 backdrop-blur-sm flex-shrink-0 shadow-sm flex-col">
          <div className="p-2 sm:p-3 md:p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <img src="./logo.svg" alt="Logo" width={24} height={24} className="rounded w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              <h2 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-primary truncate">OI Dashboard</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Select instrument</p>
            <div className="flex gap-1 mt-2">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="cursor-pointer flex items-center justify-center h-7 sm:h-8 w-7 sm:w-8 p-0"
              >
                {theme === "dark" ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="cursor-pointer flex-1 flex items-center justify-center gap-1 text-white hover:text-white text-xs py-1 h-7 sm:h-8"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <KeysList
              keys={keys}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
            />
          </div>
        </div>

        {/* Right Pane - Data Display */}
        <div className="flex-1 overflow-auto bg-background w-full">
          {loadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 sm:space-y-4 px-2">
                <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin mx-auto text-primary" />
                <p className="text-xs sm:text-sm text-muted-foreground">Loading market data...</p>
              </div>
            </div>
          ) : oiChangeData && graphData && ltpData.nifty && ltpData.banknifty ? (
            <div className="p-1 sm:p-2 md:p-3 lg:p-4 space-y-1 sm:space-y-2 md:space-y-3 max-w-[1600px] mx-auto w-full">
              {/* LTP Banner - compact without OHLC */}
              <LtpBanner data={{ nifty: ltpData.nifty!, banknifty: ltpData.banknifty! }} showOHLC={false} compact={true} />

              {/* Totals Badges */}
              <TotalsBadges totals={oiChangeData.oiChangeTotalValues} />

              {/* Graph */}
              <Graph data={graphData} />

              {/* Table */}
              <OiTable
                data={oiChangeData.filteredResults}
                totals={oiChangeData.oiChangeTotalValues}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs sm:text-sm text-muted-foreground px-2">
              Select a key to view data
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}