import { useState, useRef, useEffect } from "react";
import { Link2, Wrench, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

export function LoginDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="landing-cta-green flex items-center gap-2"
        style={{ padding: "12px 24px", cursor: "pointer" }}
        data-testid="button-login-dropdown"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>Login</span>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }} 
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 rounded-lg overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.98)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            zIndex: 100,
            animation: "fadeIn 0.15s ease-out"
          }}
          role="menu"
        >
          <button
            onClick={() => {
              setIsOpen(false);
              setLocation("/linkblue/login");
            }}
            className="w-full text-left px-4 py-4 flex items-start gap-3 transition-all"
            style={{ 
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              background: "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            role="menuitem"
            data-testid="button-login-linkblue"
          >
            <div 
              className="flex items-center justify-center rounded-lg"
              style={{ 
                width: 40, 
                height: 40, 
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                flexShrink: 0
              }}
            >
              <Link2 size={20} style={{ color: "white" }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "white", marginBottom: 2 }}>
                LINKBlue Dashboard
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                Monitor all platforms
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setLocation("/consoleblue/login");
            }}
            className="w-full text-left px-4 py-4 flex items-start gap-3 transition-all"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            role="menuitem"
            data-testid="button-login-consoleblue"
          >
            <div 
              className="flex items-center justify-center rounded-lg"
              style={{ 
                width: 40, 
                height: 40, 
                background: "linear-gradient(135deg, #10b981, #059669)",
                flexShrink: 0
              }}
            >
              <Wrench size={20} style={{ color: "white" }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "white", marginBottom: 2 }}>
                ConsoleBlue Panel
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                Build & configure apps
              </div>
            </div>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
