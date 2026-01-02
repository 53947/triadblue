import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import linkblueLogo from "@assets/LINKBlue_Logo_1767376549797.png";
import linkblueIcon from "@assets/LinkBlue_Icon_1767376653986.png";

export default function LinkBlueLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/linkblue/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Welcome to LINKBlue",
          description: "Successfully logged in to the dashboard",
        });
        setLocation("/linkblue");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #0f172a 100%)" }}
    >
      <Card className="w-full max-w-md border-0" style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(16px)" }}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <img 
              src={linkblueIcon} 
              alt="LINKBlue" 
              style={{ 
                width: 72, 
                height: 72, 
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)"
              }}
            />
          </div>
          <div className="flex justify-center mb-4">
            <img 
              src={linkblueLogo} 
              alt="LINKBlue Logo" 
              style={{ 
                height: 48,
                width: "auto"
              }}
            />
          </div>
          <CardTitle className="text-2xl text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard Login
          </CardTitle>
          <CardDescription className="text-slate-400">
            Access your cross-platform operations center
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="input-linkblue-email"
                autoFocus
                autoComplete="email"
                required
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  data-testid="input-linkblue-password"
                  autoComplete="current-password"
                  required
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-md" data-testid="text-linkblue-error">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  data-testid="checkbox-linkblue-remember"
                />
                <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/linkblue/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-linkblue-login-submit"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login to LINKBlue"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-center text-sm text-slate-500 mb-4">
              Need access? Contact your system administrator.
            </p>
            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              Back to TriadBlue.com
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
