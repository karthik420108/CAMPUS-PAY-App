import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ theme: externalTheme, setTheme: externalSetTheme, showBackButton = true, showThemeToggle = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is dashboard
  const isDashboard = location.pathname === '/vendor' || location.pathname === '/user' || 
                      location.pathname === '/subadmin' || location.pathname === '/admin';
  
  // Determine if back button should be shown
  const shouldShowBackButton = showBackButton && !isDashboard;
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "dark";
  });

  const currentTheme = externalTheme || theme;
  const currentSetTheme = externalSetTheme || setTheme;

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes headerGradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes titleSlideIn {
        0% { 
          transform: scale(0.8) translateY(20px); 
          opacity: 0; 
        }
        100% { 
          transform: scale(1) translateY(0); 
          opacity: 1; 
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Add padding to body to account for fixed header
    document.body.style.paddingTop = "52px";
    
    return () => {
      // Clean up padding when component unmounts
      document.body.style.paddingTop = "0";
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("appTheme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const isLight = currentTheme === "light";

  const headerStyle = {
    background: "linear-gradient(120deg, #1d4ed8, #3b82f6, #0ea5e9, #22c55e, #0f766e)",
    backgroundSize: "400% 400%",
    animation: "headerGradientMove 10s ease-in-out infinite",
    color: "#f9fafb",
    padding: "12px 20px",
    fontSize: "18px",
    fontWeight: 700,
    textAlign: "center",
    borderRadius: "0px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.45)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textShadow: "0 2px 8px rgba(15,23,42,0.6)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: "visible",
    minHeight: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2rem",
  };

  const backButtonStyle = {
    position: "absolute",
    top: "50%",
    left: "20px",
    transform: "translateY(-50%)",
    padding: "8px 14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
    color: "#f9fafb",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    zIndex: 10,
    transformOrigin: "center center",
    boxShadow: "0 0 0 0px transparent",
      };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    flexShrink: 0,
    animation: "titleSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards",
    opacity: 1, // Fixed: was 0, now 1
    zIndex: 1,
    position: "relative",
  };

  const topGlowStyle = {
    position: "absolute",
    top: 0,
    left: "-20%",
    width: "40%",
    height: "100%",
    background: "radial-gradient(circle at top, rgba(239,246,255,0.55), transparent 65%)",
    opacity: 0.9,
    pointerEvents: "none",
    zIndex: 0,
  };

  const bottomLineStyle = {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: 0,
    height: "2px",
    background: "linear-gradient(90deg, rgba(191,219,254,0), rgba(191,219,254,0.9), rgba(45,212,191,0))",
    zIndex: 0,
  };

  const toggleWrapperStyle = {
    position: "absolute",
    top: "50%",
    right: "16px",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 6px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.35)",
    background: "rgba(15,23,42,0.2)",
    fontSize: "10px",
    backdropFilter: "blur(8px)",
    whiteSpace: "nowrap",
    zIndex: 2,
  };

  const toggleButtonStyle = {
    border: "none",
    borderRadius: 999,
    padding: "2px 8px",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 3,
    background: isLight
      ? "linear-gradient(120deg,#020617,#0f172a)"
      : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
    color: isLight ? "#e5e7eb" : "#0f172a",
  };

  return (
    <header style={headerStyle}>
      <div style={topGlowStyle} />
      {/* Back Button - TOP LEFT - Controlled by prop */}
      {shouldShowBackButton && (
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ boxShadow: "0 0 0 2px rgba(59,130,246,0.5)" }}
          style={backButtonStyle}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          ← Back
        </motion.button>
      )}
      {/* Campus Pay - NOW VISIBLE & CENTERED */}
      <div style={titleStyle}>Campus Pay</div>
      <div style={bottomLineStyle} />
      {/* Theme toggle - TOP RIGHT */}
      {showThemeToggle && (
        <div style={toggleWrapperStyle}>
          <span style={{ color: "#e5e7eb" }}>Mode</span>
          <button
            type="button"
            onClick={() =>
              currentSetTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
            style={toggleButtonStyle}
          >
            {isLight ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
