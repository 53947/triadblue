import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import linkblueIcon from "@assets/LinkBlue_Icon_1767377569222.png";
import consoleblueIcon from "@assets/ConsoleBlue_Favicon_Lit_1767372218913.png";

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
        className="landing-cta-green"
        style={{ 
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px 20px", 
          cursor: "pointer",
          whiteSpace: "nowrap"
        }}
        data-testid="button-login-dropdown"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>Login</span>
        <ChevronDown 
          size={14} 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0
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
            className="w-full text-left px-4 py-4 flex items-center gap-3 transition-all"
            style={{ 
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              background: "transparent"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            role="menuitem"
            data-testid="button-login-linkblue"
          >
            <img 
              src={linkblueIcon} 
              alt="LINKBlue" 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: "8px",
                flexShrink: 0,
                objectFit: "cover"
              }}
            />
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
            className="w-full text-left px-4 py-4 flex items-center gap-3 transition-all"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            role="menuitem"
            data-testid="button-login-consoleblue"
          >
            <img 
              src={consoleblueIcon} 
              alt="ConsoleBlue" 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: "8px",
                flexShrink: 0,
                objectFit: "cover"
              }}
            />
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
