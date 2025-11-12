import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import consoleBlueLockup from "@assets/consoleblue-lockup.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const correctPassword = "consolblue"; // Simple password for now
    
    if (password === correctPassword) {
      localStorage.setItem("consoleblue_auth", "true");
      setLocation("/dashboard");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #060814 0%, #0b0f2a 100%)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={consoleBlueLockup} alt="ConsoleBlue" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard Access</CardTitle>
          <CardDescription>
            Enter password to access ConsoleBlue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter dashboard password"
                data-testid="input-password"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive" data-testid="text-error">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" data-testid="button-login">
              Access Dashboard
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              ← Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
