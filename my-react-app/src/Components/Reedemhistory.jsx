import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import Header1 from "./Header1";

export default function RedeemHistoryPage() {
  const locationState = useLocation()?.state;
  const userId = locationState?.vendorId;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light"); // light or dark

  const isLight = theme === "light";

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/redeem/history/${userId}`
        );
        setHistory(res.data || []);
      } catch (err) {
        console.error("Error fetching redeem history:", err);
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

      <Header1 role="vendor" userId={userId} />

      {/* Theme Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 5px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
            fontSize: 11,
          }}
        >
          <span style={{ color: "#6b7280" }}>Mode</span>
          <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            style={{
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
            }}
          >
            {isLight ? "Dark" : "Light"}
          </button>
        </div>
      </div>

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
