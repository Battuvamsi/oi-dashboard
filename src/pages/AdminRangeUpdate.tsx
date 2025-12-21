import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface UserData {
  id: number;
  username: string;
  role: string;
}

interface RangeData {
  symbol: string;
  minimum: number;
  maximum: number;
}

interface AllRanges {
  [key: string]: RangeData;
}

export default function AdminRangeUpdate() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [symbol, setSymbol] = useState("NIFTY");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentRanges, setCurrentRanges] = useState<AllRanges | null>(null);
  const [isFetchingRanges, setIsFetchingRanges] = useState(false);

  const fetchRanges = async () => {
    setIsFetchingRanges(true);
    try {
      const response = await fetch("https://ticker.pollenprints.in/api/minmax/minmaxdb");
      if (response.ok) {
        const data = await response.json();
        
        // Transform array response to object map
        const rangesMap: AllRanges = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.symbol) {
              rangesMap[item.symbol] = {
                symbol: item.symbol,
                minimum: item.minimum,
                maximum: item.maximum
              };
            }
          });
          setCurrentRanges(rangesMap);
        }
      }
    } catch (error) {
      console.error("Failed to fetch current ranges:", error);
      toast.error("Failed to load current ranges");
    } finally {
      setIsFetchingRanges(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser: UserData = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchRanges();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!minimum || !maximum) {
      toast.error("Please fill in all fields");
      return;
    }

    const minValue = parseFloat(minimum);
    const maxValue = parseFloat(maximum);

    if (isNaN(minValue) || isNaN(maxValue)) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (minValue >= maxValue) {
      toast.error("Minimum must be less than maximum");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://ticker.pollenprints.in/api/minmax/update?symbol=${symbol}&minimum=${minValue}&maximum=${maxValue}&changedBy=${user?.username || "admin"}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update range");
      }

      toast.success(`Range updated successfully for ${symbol}`);
      setMinimum("");
      setMaximum("");
      // Refresh ranges after update
      fetchRanges();
    } catch (error) {
      console.error("Error updating range:", error);
      toast.error("Failed to update range. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10 flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full space-y-6">
        {/* Current Ranges Display */}
        <Card className="p-6 bg-card/90 backdrop-blur-md shadow-xl border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Current Range Settings
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchRanges} 
              disabled={isFetchingRanges}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isFetchingRanges ? "animate-spin" : ""}`} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["NIFTY", "BANKNIFTY", "SENSEX"].map((key) => {
              const range = currentRanges?.[key];
              return (
                <div key={key} className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {key}
                  </div>
                  {range ? (
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min:</span>
                        <span className="font-mono font-medium">{range.minimum}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Max:</span>
                        <span className="font-mono font-medium">{range.maximum}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-10 flex items-center justify-center">
                      {isFetchingRanges ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="w-full p-8 bg-card/90 backdrop-blur-md shadow-2xl border-primary/20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={() => navigate("/admin")}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Update Range Settings
                </h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Configure minimum and maximum values for instruments
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="symbol" className="text-base font-semibold">Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger id="symbol" className="h-12 border-primary/30 focus:border-primary">
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NIFTY">NIFTY</SelectItem>
                    <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                    <SelectItem value="SENSEX">SENSEX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="minimum" className="text-base font-semibold">Minimum Value</Label>
                  <Input
                    id="minimum"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 25700"
                    value={minimum}
                    onChange={(e) => setMinimum(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-12 border-primary/30 focus:border-primary"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="maximum" className="text-base font-semibold">Maximum Value</Label>
                  <Input
                    id="maximum"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 26500"
                    value={maximum}
                    onChange={(e) => setMaximum(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-12 border-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <Card className="bg-gradient-to-br from-muted/50 to-primary/5 p-5 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Changed by:</strong> {user.username}
                </p>
              </Card>

              <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold text-center">
                  ⚠️ Warning: Do not update during market hours
                </p>
              </Card>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full cursor-pointer shadow-lg bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Update Range
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
}