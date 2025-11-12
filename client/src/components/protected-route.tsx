import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { checkAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const authed = await checkAuth();
      if (!authed) {
        setLocation("/login");
      } else {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };
    verify();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
