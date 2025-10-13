import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import KeysList from "@/components/KeysList";
import TotalsBadges from "@/components/TotalsBadges";
import OiTable from "@/components/OiTable";
import Graph from "@/components/Graph";
import LtpBanner from "@/components/LtpBanner";
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

  const API_BASE = "http://localhost:8080";

  // Fetch keys on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch(`${API_BASE}/cache/keys`);
        if (!response.ok) throw new Error("Failed to fetch keys");
        const data = await response.json();
        setKeys(data);
        if (data.length > 0) {
          setSelectedKey(data[0]);
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
      className="dark min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
    >
      <div className="flex h-screen">
        {/* Left Pane - Keys List */}
        <div className="w-64 border-r bg-card/80 backdrop-blur-sm flex-shrink-0 shadow-sm">
          <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-2 mb-1">
              <img src="./logo.svg" alt="Logo" width={28} height={28} className="rounded" />
              <h2 className="text-lg font-bold tracking-tight">OI Dashboard</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Select an instrument</p>
          </div>
          <KeysList
            keys={keys}
            selectedKey={selectedKey}
            onSelectKey={setSelectedKey}
          />
        </div>

        {/* Right Pane - Data Display */}
        <div className="flex-1 overflow-auto bg-background">
          {loadingData ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Loading market data...</p>
              </div>
            </div>
          ) : oiChangeData && graphData && ltpData.nifty && ltpData.banknifty ? (
            <div className="p-4 space-y-3 max-w-[1600px] mx-auto">
              {/* LTP Banner - with OHLC */}
              <LtpBanner data={{ nifty: ltpData.nifty!, banknifty: ltpData.banknifty! }} showOHLC={true} />

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
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a key to view data
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}