import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface UserData {
  id: number;
  username: string;
  role: string;
}

export default function AdminRangeUpdate() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [symbol, setSymbol] = useState("NIFTY");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full p-8 bg-card/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin")}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Update Range Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure minimum and maximum values for instruments
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger id="symbol">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIFTY">NIFTY</SelectItem>
                  <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                  <SelectItem value="SENSEX">SENSEX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum">Minimum Value</Label>
                <Input
                  id="minimum"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 25700"
                  value={minimum}
                  onChange={(e) => setMinimum(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum">Maximum Value</Label>
                <Input
                  id="maximum"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 26500"
                  value={maximum}
                  onChange={(e) => setMaximum(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Changed by:</strong> {user.username}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Range
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </Card>
    </motion.div>
  );
}
