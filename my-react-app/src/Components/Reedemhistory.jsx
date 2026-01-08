import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Header1 from "./Header1";
import Header from "./Header3"

export default function RedeemHistoryPage() {
  const locationState = useLocation()?.state;
  const navigate = useNavigate();
  const userId = locationState?.vendorId;
  
  // Debug logging
  console.log("ReedemHistory - locationState:", locationState);
  console.log("ReedemHistory - userId:", userId);
  console.log("ReedemHistory - navigate function:", typeof navigate);
  
  // Fallback if no vendorId in state
  useEffect(() => {
    if (!userId) {
      console.log("ReedemHistory - No userId found, redirecting to vendor dashboard");
      navigate("/vlogin");
      return;
    }
  }, [userId, navigate]);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "light";
  });

  // Listen for theme changes from header
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "appTheme") {
        setTheme(e.newValue || "light");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for immediate updates
    const checkTheme = () => {
      const currentTheme = localStorage.getItem("appTheme");
      if (currentTheme !== theme) {
        setTheme(currentTheme || "light");
      }
    };
    
    const interval = setInterval(checkTheme, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isLight = theme === "light";

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        console.log("ReedemHistory - No userId, skipping fetch");
        return;
      }
      setLoading(true);
      try {
        console.log("ReedemHistory - Fetching history for userId:", userId);
        const res = await axios.get(
          `http://localhost:5000/redeem/history/${userId}`
        );
        console.log("ReedemHistory - API response:", res.data);
        setHistory(res.data || []);
      } catch (err) {
        console.error("ReedemHistory - Error fetching redeem history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  // ----------------- Theme Styles -----------------
  const pageStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
      }
    : {
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%)," +
          "radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%)," +
          "radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%)," +
          "radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)",
      };

  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow:
          "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
        borderRadius: 28,
        padding: 24,
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
        borderRadius: 28,
        padding: 24,
      };

  const tableBg = isLight ? "#f1f5f9" : "#1e293b";
  const tableBorder = isLight ? "#cbd5e1" : "#334155";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        position: "relative",
        ...pageStyle,
      }}
    >
      {/* Animated Background Orbs */}
      <motion.div
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
            : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
          filter: "blur(40px)",
          opacity: 0.5,
          top: -40,
          left: -60,
          mixBlendMode: isLight ? "normal" : "screen",
          zIndex: 0,
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: 210,
          height: 210,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
            : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
          filter: "blur(34px)",
          opacity: 0.5,
          bottom: -40,
          right: -40,
          mixBlendMode: isLight ? "normal" : "screen",
          zIndex: 0,
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <Header theme={theme} setTheme={setTheme} />
      <Header1 role="vendor" userId={userId} />
      
      {/* Back Button */}
      <motion.button
        onClick={() => {
          console.log("ReedemHistory - Back button clicked, userId:", userId);
          console.log("ReedemHistory - Navigating to /vlogin with state:", { vendorId: userId });
          navigate("/vlogin", { state: { vendorId: userId } });
        }}
        whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(59,130,246,0.5)" }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 14px",
          borderRadius: "14px",
          border: "none",
          background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
          color: "#f9fafb",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
          zIndex: 10,
        }}
      >
        ← Back
      </motion.button>
      

      
      {/* Card */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
          ...cardStyle,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24, color: textMain }}>
          Redeem History
        </h2>

        {loading && (
          <p style={{ textAlign: "center", color: textSub }}>Loading...</p>
        )}

        {!loading && history.length === 0 && (
          <p
            style={{
              textAlign: "center",
              color: textSub,
              fontStyle: "italic",
            }}
          >
            No redeem history found.
          </p>
        )}

        {history.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr>
                  {["Date", "Amount", "Status", "Closing Balance"].map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        background: tableBg,
                        borderBottom: `2px solid ${tableBorder}`,
                        color: textMain,
                        fontWeight: 600,
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <motion.tr
                    key={item._id}
                    style={{ transition: "background 0.2s" }}
                    whileHover={{
                      backgroundColor: isLight ? "#e0f2fe33" : "#ffffff10",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${tableBorder}`,
                        color: textMain,
                      }}
                    >
                      {new Date(item.date).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${tableBorder}`,
                        color: textMain,
                      }}
                    >
                      ₹{item.amount}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${tableBorder}`,
                        color:
                          item.status === "SUCCESS"
                            ? "#22c55e"
                            : item.status === "FAILED"
                            ? "#ef4444"
                            : "#f59e0b",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${tableBorder}`,
                        color: textMain,
                      }}
                    >
                      ₹{item.closingBalance}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
