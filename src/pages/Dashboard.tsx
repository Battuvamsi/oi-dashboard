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
import TradingViewWidget from "@/components/TradingViewWidget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [ltpData, setLtpData] = useState<{ nifty: LtpData | null; banknifty: LtpData | null; sensex: LtpData | null }>({
    nifty: null,
    banknifty: null,
    sensex: null,
  });
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [historicalKeys, setHistoricalKeys] = useState<string[]>([]);
  const [loadingHistoricalKeys, setLoadingHistoricalKeys] = useState(false);

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

  // Fetch historical keys when date is selected
  useEffect(() => {
    if (!selectedDate || activeTab !== "history") return;

      const fetchHistoricalKeys = async () => {
      setLoadingHistoricalKeys(true);
      try {
        // Use UTC methods to avoid timezone issues
        const year = selectedDate.getUTCFullYear();
        const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const response = await fetch(`${API_BASE}/api/oi-graph/symbols/${dateStr}`);
        if (!response.ok) throw new Error("Failed to fetch historical keys");
        const data = await response.json();
        setHistoricalKeys(data);
        if (data.length > 0) {
          setSelectedKey(data[0]);
        }
      } catch (error) {
        console.error("Error fetching historical keys:", error);
        toast.error("Failed to load historical data for selected date");
        setHistoricalKeys([]);
      } finally {
        setLoadingHistoricalKeys(false);
      }
    };

    fetchHistoricalKeys();
  }, [selectedDate, activeTab]);

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
        // For history tab, use the new API endpoint
        if (activeTab === "history" && selectedDate) {
          // Use UTC methods to avoid timezone issues
          const year = selectedDate.getUTCFullYear();
          const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getUTCDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          const response = await fetch(`${API_BASE}/api/oi-graph/data/${dateStr}/${selectedKey}`);
          if (!response.ok) throw new Error("Failed to fetch historical graph data");
          const data = await response.json();
          
          // Transform the response to match Graph component's expected format
          const transformedData = {
            key: selectedKey,
            values: data.map((item: any) => ({
              dateTime: item.keyDateTime,
              oichangeFinalResult: {
                oiChangeTotalValues: {
                  totalImbalance: item.totalImbalance,
                  pcr: item.pcr
                }
              }
            }))
          };
          
          setGraphData(transformedData);
        } else {
          // For today tab, use the existing endpoint
          const response = await fetch(`${API_BASE}/cache/graph/${selectedKey}`);
          if (!response.ok) throw new Error("Failed to fetch graph data");
          const data = await response.json();
          setGraphData(data);
        }
      } catch (error) {
        console.error("Error fetching graph data:", error);
        toast.error("Failed to load graph data");
      }
    };

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
          setLtpData({
            nifty: niftyData,
            banknifty: bankniftyData,
            sensex: sensexData,
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
        if (activeTab === "history") {
          // For history, only fetch graph data (no OI data or LTP)
          await fetchGraphData();
        } else {
          // For today, fetch all data
          await Promise.all([fetchOiData(), fetchGraphData(), fetchLtpData()]);
        }
      } finally {
        setLoadingData(false);
      }
    };

    initialFetch();

    // Set up intervals only for "today" tab
    if (activeTab === "today") {
      const ltpInterval = setInterval(fetchLtpData, 3000); // Every 3 seconds
      const oiInterval = setInterval(fetchOiData, 5000); // Every 5 seconds
      const graphInterval = setInterval(fetchGraphData, 60000); // Every 1 minute

      return () => {
        clearInterval(ltpInterval);
        clearInterval(oiInterval);
        clearInterval(graphInterval);
      };
    }
  }, [selectedKey, activeTab, selectedDate]);

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
        {/* Mobile Header with Dropdown */}
        <div className="lg:hidden w-full p-2 sm:p-3 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between gap-2">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="cursor-pointer flex items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 flex-shrink-0 px-2 sm:px-3"
          >
            {theme === "dark" ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="text-xs sm:text-sm">{theme === "dark" ? "Light" : "Dark"} Mode</span>
          </Button>
          <Select value={selectedKey || ""} onValueChange={setSelectedKey}>
            <SelectTrigger className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Select an instrument">
                {selectedKey && (() => {
                  const parts = selectedKey.split('_');
                  const index = parts[0];
                  const dateStr = parts[1];
                  let formattedDate = '';
                  
                  if (dateStr) {
                    const dateParts = dateStr.split('-');
                    if (dateParts.length === 3) {
                      const [year, month, day] = dateParts;
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
                    }
                  }
                  
                  return (
                    <div className="flex flex-col items-start">
                      <span className="text-foreground font-bold tracking-wide text-xs sm:text-sm">{index}</span>
                      {formattedDate && (
                        <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                      )}
                    </div>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {keys.map((key) => {
                const parts = key.split('_');
                const index = parts[0];
                const dateStr = parts[1];
                let formattedDate = '';
                
                if (dateStr) {
                  const dateParts = dateStr.split('-');
                  if (dateParts.length === 3) {
                    const [year, month, day] = dateParts;
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    formattedDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
                  }
                }
                
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{index}</span>
                      {formattedDate && (
                        <span className="text-xs text-muted-foreground">{formattedDate}</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="cursor-pointer flex items-center justify-center gap-1 text-red-400 hover:text-red-300 border-red-400 hover:border-red-300 text-xs py-1 h-8 sm:h-9 flex-shrink-0"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Left Pane - Keys List (Desktop only) */}
        <div className="hidden lg:flex lg:w-48 border-b lg:border-b-0 lg:border-r bg-card/80 backdrop-blur-sm flex-shrink-0 shadow-sm flex-col">
          <div className="p-2 border-b bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-1.5 mb-1">
              <img src="./logo.svg" alt="Logo" width={20} height={20} className="rounded w-5 h-5" />
              <h2 className="text-xs font-bold tracking-tight text-primary truncate">OI Dashboard</h2>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Select instrument</p>
            <div className="flex gap-1 mt-1.5">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="cursor-pointer flex-1 flex items-center justify-center gap-1 text-red-400 hover:text-red-300 border-red-400 hover:border-red-300 text-[10px] py-1 h-7"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <KeysList
              keys={activeTab === "history" ? historicalKeys : keys}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
            />
          </div>
          <div className="p-1.5 border-t">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="cursor-pointer w-full flex items-center justify-center gap-1.5 h-7"
            >
              {theme === "dark" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              <span className="text-[10px]">{theme === "dark" ? "Light" : "Dark"} Mode</span>
            </Button>
          </div>
        </div>

        {/* Right Pane - Data Display with Tabs */}
        <div className="flex-1 overflow-auto bg-background w-full flex flex-col">
          {/* Navbar with Tabs */}
          <div className="border-b bg-card/80 backdrop-blur-sm px-2 sm:px-4 py-2 flex items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="today" className="text-xs sm:text-sm">Today</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-xs font-semibold text-muted-foreground">
                IST: {new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', { 
                  timeZone: 'UTC',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </div>
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="cursor-pointer flex items-center justify-center gap-2 h-8 px-3"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="text-xs">{theme === "dark" ? "Light" : "Dark"} Mode</span>
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "today" ? (
              loadingData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2 sm:space-y-4 px-2">
                    <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin mx-auto text-primary" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Loading market data...</p>
                  </div>
                </div>
              ) : oiChangeData && graphData && ltpData.nifty && ltpData.banknifty && ltpData.sensex ? (
                <div className="p-1 sm:p-2 md:p-3 lg:p-4 space-y-1 sm:space-y-2 md:space-y-3 max-w-[1600px] mx-auto w-full">
                  {/* LTP Banner - compact without OHLC */}
                  <LtpBanner data={{ nifty: ltpData.nifty!, banknifty: ltpData.banknifty!, sensex: ltpData.sensex! }} showOHLC={false} compact={true} />

                  {/* Totals Badges */}
                  <TotalsBadges totals={oiChangeData.oiChangeTotalValues} />

                  {/* Graph */}
                  <Graph data={graphData} />

                  {/* TradingView Widget for SENSEX */}
                  {selectedKey && selectedKey.toUpperCase().includes('SENSEX') && (
                    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border bg-card/80 backdrop-blur-sm p-1">
                      <TradingViewWidget />
                    </div>
                  )}

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
              )
            ) : (
              <div className="p-2 sm:p-2 md:p-3 max-w-6xl mx-auto h-full flex flex-col">
                <div className="space-y-2">
                  <div className="text-center space-y-0.5">
                    <h2 className="text-base font-bold text-foreground">Historical Data</h2>
                    <p className="text-xs text-muted-foreground">Select a date to view historical options data</p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      Current IST Time: {new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', { 
                        timeZone: 'UTC',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-sm">
                      <label className="block text-xs font-medium mb-1">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            // Parse the date string as UTC to avoid timezone shifts
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const utcDate = new Date(Date.UTC(year, month - 1, day));
                            setSelectedDate(utcDate);
                          } else {
                            setSelectedDate(undefined);
                          }
                        }}
                        className="w-full px-4 py-2 border-2 border-primary/40 rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:invert-[0.5] [&::-webkit-calendar-picker-indicator]:sepia-[1] [&::-webkit-calendar-picker-indicator]:hue-rotate-[200deg]"
                      />
                    </div>

                    {loadingHistoricalKeys && (
                      <div className="text-center space-y-1">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                        <p className="text-[10px] text-muted-foreground">Loading historical data...</p>
                      </div>
                    )}

                    {!loadingHistoricalKeys && selectedDate && historicalKeys.length === 0 && (
                      <div className="text-center text-[10px] text-muted-foreground">
                        No data available for the selected date
                      </div>
                    )}

                    {!loadingHistoricalKeys && historicalKeys.length > 0 && (
                      <div className="w-full flex-1 min-h-0">
                        {loadingData ? (
                          <div className="flex items-center justify-center py-2">
                            <div className="text-center space-y-1">
                              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                              <p className="text-[10px] text-muted-foreground">Loading data...</p>
                            </div>
                          </div>
                        ) : graphData ? (
                          <div className="space-y-1">
                            <Graph data={graphData} />
                          </div>
                        ) : (
                          <div className="text-center text-[10px] text-muted-foreground">
                            Select an instrument from the left sidebar
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}