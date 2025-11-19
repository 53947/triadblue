import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`flex flex-col flex-1 min-w-0 overflow-y-auto overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
}
