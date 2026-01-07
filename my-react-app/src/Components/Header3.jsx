import { useEffect, useState } from "react";

function Header({ theme: externalTheme, setTheme: externalSetTheme }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "light";
  });

  // Use external theme if provided, otherwise use local state
  const currentTheme = externalTheme || theme;
  const currentSetTheme = externalSetTheme || setTheme;

  // Inject keyframes once
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes headerGradientMove {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Scroll to top when header mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Persist theme and expose it globally for all pages
  useEffect(() => {
    localStorage.setItem("appTheme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const isLight = currentTheme === "light";

  const headerStyle = {
    background:
      "linear-gradient(120deg, #1d4ed8, #3b82f6, #0ea5e9, #22c55e, #0f766e)",
    backgroundSize: "400% 400%",
    animation: "headerGradientMove 10s ease-in-out infinite",
    color: "#f9fafb",
    padding: "14px 24px",
    fontSize: "20px",
    fontWeight: 700,
    textAlign: "center",
    borderRadius: "0px",
    boxShadow: "0 10px 28px rgba(15,23,42,0.45)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textShadow: "0 2px 8px rgba(15,23,42,0.6)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const topGlowStyle = {
    position: "absolute",
    top: 0,
    left: "-20%",
    width: "40%",
    height: "100%",
    background:
      "radial-gradient(circle at top, rgba(239,246,255,0.55), transparent 65%)",
    opacity: 0.9,
    pointerEvents: "none",
  };

  const bottomLineStyle = {
    position: "absolute",
    left: "0",
    right: "0",
    bottom: 0,
    height: "2px",
    background:
      "linear-gradient(90deg, rgba(191,219,254,0), rgba(191,219,254,0.9), rgba(45,212,191,0))",
  };

  const toggleWrapperStyle = {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.35)",
    background: "rgba(15,23,42,0.2)",
    fontSize: 11,
    backdropFilter: "blur(8px)",
  };

  const toggleButtonStyle = {
    border: "none",
    borderRadius: 999,
    padding: "3px 10px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: isLight
      ? "linear-gradient(120deg,#020617,#0f172a)"
      : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
    color: isLight ? "#e5e7eb" : "#0f172a",
  };

  return (
    <header style={headerStyle}>
      <div style={topGlowStyle} />
      Campus Pay
      <div style={bottomLineStyle} />
      {/* Theme toggle in header – controls global theme */}
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
    </header>
  );
}

export default Header;
