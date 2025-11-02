import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, LogOut, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface UserData {
  id: number;
  username: string;
  role: string;
}

export default function AdminWelcome() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
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
      <Card className="max-w-2xl w-full p-8 bg-card/90 backdrop-blur-md shadow-2xl border-primary/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-8"
        >
          <div className="flex justify-center">
            <motion.div 
              className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="h-20 w-20 text-primary" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Welcome, Administrator
            </h1>
            <p className="text-xl text-muted-foreground">
              You have full access to the system
            </p>
          </div>

          <Card className="p-6 bg-gradient-to-br from-muted/50 to-primary/5 border-primary/20 shadow-md">
            <div className="flex items-center gap-4 justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground font-medium">Logged in as</p>
                <p className="font-bold text-xl text-foreground">{user.username}</p>
              </div>
            </div>
          </Card>

          <div className="pt-6 space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => navigate("/admin/range-update")}
                variant="default"
                size="lg"
                className="cursor-pointer w-full shadow-lg bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
              >
                <Settings className="mr-2 h-5 w-5" />
                Update Range Settings
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="lg"
                className="cursor-pointer w-full border-red-400/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}