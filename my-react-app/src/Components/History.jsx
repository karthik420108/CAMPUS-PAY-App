import Header1 from "./Header1";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // changed to framer-motion
import Header from "./Header3";
import API_CONFIG from "../config/api";

function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role } = location.state || {};
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
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
  const [isFrozen, setIsFrozen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [blockingMessage, setBlockingMessage] = useState("");

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user data and transactions in parallel
        const [userRes, txnRes] = await Promise.all([
          axios.get(API_CONFIG.getUrl(`/user/${userId}`)),
          axios.get(API_CONFIG.getUrl(`/transactions/${userId}`))
        ]);
        
        const { isFrozen, isSuspended } = userRes.data;
        setIsFrozen(isFrozen);
        setIsSuspended(isSuspended);
        setTransactions(txnRes.data);
        setLoading(false);

        // Handle redirects
        if (isSuspended) {
          setBlockingMessage(
            "Your account is suspended. Redirecting to homepage..."
          );
          setTimeout(() => navigate("/"), 2500);
          return;
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUserData();

    // Optional: real-time polling every 30s (reduced from 5s)
    const interval = setInterval(fetchUserData, 30000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [transactions]);
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return sortedTransactions;
    const q = searchTerm.trim().toLowerCase();
    return sortedTransactions.filter((t) => {
      const matchesTxid = t.txid && t.txid.toLowerCase().includes(q);
      const matchesVendorName = t.vendorName && t.vendorName.toLowerCase().includes(q);
      const matchesVendorIdName = t.vendorId?.vendorName && t.vendorId.vendorName.toLowerCase().includes(q);
      return matchesTxid || matchesVendorName || matchesVendorIdName;
    });
  }, [sortedTransactions, searchTerm]);

  const getStatusColor = (status) => {
    const lower = status?.toLowerCase();
    if (lower === "completed" || lower === "success") return "#22c55e";
    if (lower === "pending") return "#f59e0b";
    return "#ef4444";
  };

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
          "radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)," +
          "linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(15,23,42,0.9) 1px, transparent 1px)",
        backgroundSize: "cover, cover, cover, cover, 80px 80px, 80px 80px",
        backgroundPosition: "center, center, center, center, 0 0, 0 0",
      };

  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow:
          "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };
  if (blockingMessage) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 18,
          fontWeight: 600,
          color: "#ef4444",
        }}
      >
        {blockingMessage}
      </div>
    );
  }

  return (
    <>
      <Header1 userId={userId} role={role} />
      <Header theme={theme} setTheme={setTheme} />

      
      <motion.div
        style={{
          minHeight: "100vh",
          padding: "32px 20px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
          overflow: "hidden",
          ...pageStyle,
        }}
      >
        {/* Background Orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 230,
            height: 230,
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
            opacity: 0.45,
            bottom: -40,
            right: -40,
            mixBlendMode: isLight ? "normal" : "screen",
            zIndex: 0,
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 850,
            borderRadius: 28,
            padding: "32px 28px 24px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            zIndex: 10,
            ...cardStyle,
          }}
        >
          {/* Top Accent */}
          <motion.div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              top: 12,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              opacity: 0.9,
            }}
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: easingSoft }}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: textSub,
                marginBottom: 4,
              }}
            >
              Transactions
            </div>
            <h2
              style={{
                fontSize: 24,
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: textMain,
                margin: 0,
              }}
            >
              Transaction History
            </h2>
          </motion.div>

          {/* Full Width Search Bar */}
          <div
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 6,
            }}
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Transaction ID or Vendor Name"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: textMain,
                fontSize: 14,
                fontWeight: 500,
              }}
            />
            {searchTerm.trim() !== "" && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  color: textSub,
                  padding: "4px",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                ×
              </button>
            )}
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: easingSoft }}
            style={{
              height: 1,
              borderRadius: 999,
              background: isLight
                ? "linear-gradient(90deg,transparent,#dbeafe,#93c5fd,transparent)"
                : "linear-gradient(90deg,transparent,#1e293b,#0f172a,transparent)",
              margin: "0 4px 16px",
            }}
          />

          {/* Transactions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loading ? (
              // Modern Loading Animation
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "80px 20px",
                  width: "100%",
                }}
              >
                <motion.div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* Main Loading Spinner */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "3px solid rgba(59, 130, 246, 0.2)",
                      borderTop: "3px solid #3b82f6",
                      borderRight: "3px solid #0ea5e9",
                      borderBottom: "3px solid #22c55e",
                      borderLeft: "3px solid #0f766e",
                      position: "relative",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(59,130,246,0.05))",
                    }}
                  >
                    {/* Inner Glow */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(59,130,246,0.8), transparent)",
                        filter: "blur(8px)",
                      }}
                    />
                  </motion.div>
                  
                  {/* Loading Text */}
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isLight ? "#3b82f6" : "#60a5fa",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Loading Transactions...
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: textSub,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background: isLight
                      ? "linear-gradient(120deg,#dbeafe,#93c5fd)"
                      : "linear-gradient(120deg,#1e40af,#3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 32px rgba(59,130,246,0.2)",
                  }}
                >
                  <span
                    style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}
                  >
                    💳
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: textMain }}>
                  {searchTerm.trim() ? "No matching transactions" : "No transactions found"}
                </p>
              </motion.div>
            ) : (
              filteredTransactions.map((t, index) => {
                const statusColor = getStatusColor(t.status);

                return (
                  <motion.div
                    key={t._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.03,
                      duration: 0.4,
                      ease: easingSoft,
                    }}
                    whileHover={{
                      y: -4,
                      boxShadow:
                        "0 24px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.4)",
                    }}
                    onClick={() =>
                      navigate(`/transaction/${t.txid}`, { state: { txn: t } })
                    }
                    style={{
                      padding: "20px",
                      borderRadius: 20,
                      cursor: "pointer",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid rgba(148,163,184,0.3)",
                      background: isLight
                        ? "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))"
                        : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(17,24,39,0.98))",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Left Section */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <motion.span
                        animate={{
                          boxShadow: [
                            `0 0 0 0 ${statusColor}44`,
                            `0 0 0 12px ${statusColor}00`,
                          ],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: statusColor,
                          color: "#ffffff",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          width: "fit-content",
                        }}
                      >
                        {t.status}
                      </motion.span>

                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: textMain,
                        }}
                      >
                        {new Date(t.createdAt).toLocaleDateString()} ·{" "}
                        {new Date(t.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <small style={{ color: textSub, fontSize: 12 }}>
                        TXID: {t.txid?.slice(0, 8)}...
                      </small>
                      <small style={{ color: textSub, fontSize: 12 }}>
                        User: {t.vendorName}
                      </small>
                    </div>

                    {/* Right Section - Amount */}
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: statusColor,
                        letterSpacing: "-0.02em",
                        textShadow: isLight
                          ? "0 2px 8px rgba(0,0,0,0.1)"
                          : "0 2px 8px rgba(255,255,255,0.1)",
                      }}
                    >
                      ₹{t.amount}
                    </motion.span>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default History;
