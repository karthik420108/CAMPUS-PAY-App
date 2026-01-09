import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./Header3";
import Header1 from "./Header1"
import { useLocation, useNavigate } from "react-router-dom";
import SuspensionBanner from "./SuspensionBanner";
import { useVendorStatus } from "../hooks/useVendorStatus";
import API_CONFIG from "../config/api";

function VendorTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "light";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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

  const { state } = useLocation();
  const { userId } = state || {};
  
  // For vendor transactions, userId should actually be vendorId
  const vendorId = userId;
  
  // Use vendor status hook for real-time monitoring
  const { showSuspensionBanner, isFrozen } = useVendorStatus(userId);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(API_CONFIG.getUrl(`/transactions/vendor/${vendorId}`));
        console.log('Vendor transactions response:', res.data);
        console.log('First transaction:', res.data.transactions[0]);
        setTransactions(res.data.transactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    if (vendorId) fetchTransactions();
  }, [vendorId]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return sortedTransactions;
    const q = searchTerm.trim().toLowerCase();
    return sortedTransactions.filter((t) => {
      const matchesTxid = t.txid && t.txid.toLowerCase().includes(q);
      const matchesUserEmail = t.userId?.collegeEmail && t.userId.collegeEmail.toLowerCase().includes(q);
      const matchesUserName = (t.userId?.firstName && t.userId.firstName.toLowerCase().includes(q)) ||
                            (t.userId?.lastName && t.userId.lastName.toLowerCase().includes(q)) ||
                            ((t.userId?.firstName + " " + t.userId?.lastName).toLowerCase().includes(q));
      return matchesTxid || matchesUserEmail || matchesUserName;
    });
  }, [sortedTransactions, searchTerm]);

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";

  // Status color logic - GREEN ONLY FOR SUCCESS/COMPLETED
  const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === "completed" || lowerStatus === "success") {
      return "#22c55e"; // Green for success
    } else if (lowerStatus === "pending") {
      return "#f59e0b"; // Yellow/Orange for pending
    } else {
      return "#ef4444"; // Red for failed/other
    }
  };

  // ✨ EXACT RaiseComplaint THEME STYLES
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

  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

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

  return (
    <>
      <Header1 role="vendor" userId={vendorId} isFrozen={isFrozen} isOp={setSidebarOpen}/>
      <Header theme={theme} setTheme={setTheme} />
      <SuspensionBanner show={showSuspensionBanner} />

      {/* Back Button */}
      <motion.button
        onClick={() => navigate("/vlogin", { state: { vendorId } })}
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
        {/* ✨ Background Orbs */}
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

        {/* ✨ Main Container */}
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
          {/* ✨ Top Accent */}
          <motion.div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              top: 12,
              height: 2,
              borderRadius: 999,
              background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              opacity: 0.9,
            }}
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ✨ Title */}
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
              Vendor Transactions
            </h2>
          </motion.div>

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

          {/* ✨ Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: easingSoft }}
            style={{ marginBottom: 20 }}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              <input
                type="text"
                placeholder="Search by Transaction ID, User Email, or User Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 45px 12px 18px",
                  borderRadius: "16px",
                  border: `1px solid ${isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)"}`,
                  background: isLight
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(15,23,42,0.7)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontSize: "14px",
                  color: isLight ? "#1e293b" : "#f1f5f9",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight ? "#3b82f6" : "#60a5fa";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(59,130,246,0.1)"
                    : "0 0 0 3px rgba(96,165,250,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {searchTerm && (
                <AnimatePresence>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchTerm("")}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: isLight ? "#64748b" : "#94a3b8",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{ scale: 1.1, color: isLight ? "#ef4444" : "#f87171" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ×
                  </motion.button>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* ✨ Transactions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredTransactions.length === 0 ? (
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
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>
                    💳
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: textMain }}>
                  {searchTerm.trim() ? "No matching transactions found" : "No transactions found"}
                </p>
              </motion.div>
            ) : (
              filteredTransactions.map((t, index) => {
                const statusColor = getStatusColor(t.status); // ✅ GREEN ONLY FOR SUCCESS

                return (
                  <motion.div
                    key={t._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.4, ease: easingSoft }}
                    whileHover={{
                      y: -4,
                      boxShadow:
                        "0 24px 60px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.4)",
                    }}
                    onClick={() =>
                      navigate(`/transaction/${t.txid}`, {
                        state: { txn : t  , role : "vendor"},
                      })
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <motion.span
                        animate={{
                          boxShadow: [
                            `0 0 0 0 ${statusColor}44`,
                            `0 0 0 12px ${statusColor}00`,
                          ],
                        }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
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

                      <div style={{ fontSize: 14, fontWeight: 600, color: textMain }}>
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
                        User: {t.userId?.firstName} {t.userId?.lastName}
                      </small>
                      <small style={{ color: textSub, fontSize: 12 }}>
                        Email: {t.userId?.collegeEmail || t.userId?.email || t.userId?.Email || "No Email"}
                      </small>
                    </div>

                    {/* Right Section - Amount */}
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: statusColor, // ✅ GREEN ONLY FOR SUCCESS
                        letterSpacing: "-0.02em",
                        textShadow: isLight ? "0 2px 8px rgba(0,0,0,0.1)" : "0 2px 8px rgba(255,255,255,0.1)",
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

export default VendorTransactions;
