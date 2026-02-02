import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import consoleblueIcon from "@assets/ConsoleBlue_Favicon_Lit_1767372218913.png";

export default function ConsoleBlueResetPassword() {
  const { toast } = useToast();
  const searchString = useSearch();
  const token = new URLSearchParams(searchString).get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false);
        setIsValidToken(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        const data = await response.json();
        setIsValidToken(data.valid);
      } catch (err) {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password reset successful",
          description: "You can now log in with your new password",
        });
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(180deg, #052e16 0%, #0f172a 100%)" }}
      >
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #052e16 0%, #0f172a 100%)" }}
    >
      <Card className="w-full max-w-md border-0" style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(16px)" }}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <img 
              src={consoleblueIcon} 
              alt="ConsoleBlue" 
              style={{ 
                width: 72, 
                height: 72, 
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)"
              }}
            />
          </div>
          <CardTitle className="text-2xl text-white" style={{ fontFamily: "var(--font-heading)" }}>
            {isSuccess ? "Password Reset Complete" : isValidToken ? "Create New Password" : "Invalid Link"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isSuccess 
              ? "Your password has been updated" 
              : isValidToken 
                ? "Enter your new password below"
                : "This password reset link is invalid or has expired"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-6">
                You can now log in with your new password.
              </p>
              <Link href="/consoleblue/login">
                <Button 
                  className="w-full"
                  data-testid="button-go-to-login"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : isValidToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    data-testid="input-new-password"
                    autoFocus
                    required
                    minLength={8}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                    required
                    minLength={8}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-md" data-testid="text-reset-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-reset-submit"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-6">
                Please request a new password reset link.
              </p>
              <Link href="/consoleblue/forgot-password">
                <Button 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  data-testid="button-request-new-link"
                >
                  Request New Link
                </Button>
              </Link>
            </div>
          )}

          {!isSuccess && isValidToken && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <Link href="/consoleblue/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
