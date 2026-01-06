import Header1 from "./Header1";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "motion/react";
import Header from "./Header3"

function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role } = location.state || {};
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("light");
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

    axios
      .get(`http://localhost:5000/transactions/${userId}`)
      .then((res) => {
        setTransactions(res.data);
      })
      .catch(console.error);
  }, [userId, navigate]);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/user/${userId}`);
        const { isFrozen, isSuspended } = userRes.data;

        setIsFrozen(isFrozen);
        setIsSuspended(isSuspended);

        // Handle redirects
        if (isSuspended) {
          setBlockingMessage(
            "Your account is suspended. Redirecting to homepage..."
          );
          setTimeout(() => navigate("/", 2500));
          return;
        }

        // Fetch transactions only if not blocked
        const txnRes = await axios.get(
          `http://localhost:5000/transactions/${userId}`
        );
        setTransactions(txnRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

    // Optional: real-time polling every 5s
    const interval = setInterval(fetchUserData, 5000);
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
      <Header></Header>

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
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)",
              zIndex: 6,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Transaction ID or Vendor Name"
              style={{
                width: 260,
                border: "none",
                outline: "none",
                background: "transparent",
                color: textMain,
                fontSize: 12,
                fontWeight: 600,
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
                  fontSize: 14,
                  lineHeight: 1,
                  color: textSub,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 6px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 11,
              zIndex: 5,
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
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
            </motion.button>
          </div>

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
