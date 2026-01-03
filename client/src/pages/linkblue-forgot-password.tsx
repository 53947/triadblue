import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import linkblueIcon from "@assets/LinkBlue_Icon_1767377569222.png";

export default function LinkBlueForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform: "linkblue" }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for password reset instructions",
        });
      } else {
        setError(data.message || "Failed to send reset link");
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
          <CardTitle className="text-2xl text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isSubmitted ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
              <p className="text-slate-400 mb-6">
                If an account exists for {email}, you'll receive a password reset link shortly.
              </p>
              <Link href="/linkblue/login">
                <Button 
                  variant="outline" 
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    data-testid="input-forgot-email"
                    autoFocus
                    autoComplete="email"
                    required
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-md" data-testid="text-forgot-error">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-forgot-submit"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          {!isSubmitted && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <Link href="/linkblue/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
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
