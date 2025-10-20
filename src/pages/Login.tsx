import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, UserX } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface LoginResponse {
  id: number;
  username: string;
  password: null;
  role: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Login attempt with:", { username, password });
      
      const response = await fetch("https://pollenprints.in/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data: LoginResponse = await response.json();
      console.log("Login response data:", data);

      // Check if login was successful by verifying we got user data
      if (!data.id || !data.username || !data.role) {
        throw new Error("Invalid credentials");
      }

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data));
      
      toast.success(`Welcome back, ${data.username}!`);

      // Role-based routing
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "user") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Unable to connect to login server. Please check your connection or contact support.");
      } else {
        toast.error("Invalid username or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Create a guest user object
    const guestUser = {
      id: 0,
      username: "Guest",
      role: "user"
    };
    
    localStorage.setItem("user", JSON.stringify(guestUser));
    toast.success("Continuing as guest");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md border shadow-lg">
        <CardHeader className="text-center p-3 sm:p-6">
          <div className="flex justify-center mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="username" className="text-xs sm:text-sm">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            <Button
              type="submit"
              className="w-full text-xs sm:text-sm h-8 sm:h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}