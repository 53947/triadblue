import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!response.ok) {
          setLocation("/consoleblue/login");
          return;
        }
        const data = await response.json();
        if (!data.user) {
          setLocation("/consoleblue/login");
          return;
        }
        // Check for ConsoleBlue access
        if (!data.user.consoleblueAccess) {
          // User doesn't have ConsoleBlue access, redirect to appropriate location
          if (data.user.linkblueAccess) {
            setLocation("/linkblue");
          } else {
            setLocation("/consoleblue/login");
          }
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        setLocation("/consoleblue/login");
      } finally {
        setIsChecking(false);
      }
    };
    verify();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading ConsoleBlue...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function LinkBlueProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!response.ok) {
          setLocation("/linkblue/login");
          return;
        }
        const data = await response.json();
        if (!data.user) {
          setLocation("/linkblue/login");
          return;
        }
        // Check for LINKBlue access - this is the critical check
        if (!data.user.linkblueAccess) {
          // User doesn't have LINKBlue access, redirect to appropriate location
          if (data.user.consoleblueAccess) {
            setLocation("/dashboard");
          } else {
            setLocation("/linkblue/login");
          }
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        setLocation("/linkblue/login");
      } finally {
        setIsChecking(false);
      }
    };
    verify();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "linear-gradient(180deg, #0a1628 0%, #0f172a 100%)" }}>
        <div className="text-blue-400 flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Loading LINKBlue...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
