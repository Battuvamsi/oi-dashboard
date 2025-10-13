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
  const [ltpData, setLtpData] = useState<LtpData | null>(null);
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

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [oiResponse, graphResponse, ltpResponse] = await Promise.all([
          fetch(`${API_BASE}/cache/getOiChange/${selectedKey}`),
          fetch(`${API_BASE}/cache/graph/${selectedKey}`),
          fetch(`${API_BASE}/cache/ltp/${selectedKey}`),
        ]);

        if (!oiResponse.ok || !graphResponse.ok || !ltpResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const oiData = await oiResponse.json();
        const gData = await graphResponse.json();
        const lData = await ltpResponse.json();

        setOiChangeData(oiData);
        setGraphData(gData);
        setLtpData(lData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data for selected key");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
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
      className="min-h-screen bg-background"
    >
      <div className="flex h-screen">
        {/* Left Pane - Keys List */}
        <div className="w-64 border-r bg-card flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold tracking-tight">OI Change Dashboard</h2>
          </div>
          <KeysList
            keys={keys}
            selectedKey={selectedKey}
            onSelectKey={setSelectedKey}
          />
        </div>

        {/* Right Pane - Data Display */}
        <div className="flex-1 overflow-auto">
          {loadingData ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : oiChangeData && graphData && ltpData ? (
            <div className="p-6 space-y-6">
              {/* LTP Banner */}
              <LtpBanner data={ltpData} />

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