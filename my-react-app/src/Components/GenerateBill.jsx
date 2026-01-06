import { useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header1 from "./Header1";
import { motion } from "motion/react";
import Header from "./Header3"
import { useNavigate } from "react-router-dom";

function GenerateBill() {
  const { state } = useLocation();
  const { userId } = state || {};
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";
  const [isFrozen, setIsFrozen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [blockingMessage, setBlockingMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/generate-bill/${userId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

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

        if (isSuspended) {
          setBlockingMessage(
            "Your account is suspended. Redirecting to homepage..."
          );
          setTimeout(() => navigate("/", { state: { userId } }), 2500);
          return;
        }

        const txnRes = await axios.get(
          `http://localhost:5000/transactions/${userId}`
        );
        setTransactions(txnRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

    const interval = setInterval(fetchUserData, 5000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

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

  const totalSpent = useMemo(() => {
    if (!data?.transactions) return 0;
    return data.transactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [data]);

  // ---------- THEME-DEPENDENT STYLES (dark from RaiseComplaint) ----------
  const pageStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        padding: 32,
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
        minHeight: "100vh",
        padding: 32,
        color: "#e5e7eb",
        position: "relative",
        overflow: "hidden",
      };

  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 16px 38px rgba(15,23,42,0.18)",
        width: "100%",
        maxWidth: 900,
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
        width: "100%",
        maxWidth: 900,
        color: "#e5e7eb",
      };

  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "success" || s === "completed") return "#22c55e";
    if (s === "pending") return "#f59e0b";
    return "#ef4444";
  };

  if (loading)
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: 50,
          color: isLight ? "#6b7280" : "#94a3b8",
        }}
      >
        Loading bill...
      </p>
    );

  if (!data || !data.transactions)
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: 50,
          color: "#f87171",
        }}
      >
        No data available.
      </p>
    );

  return (
    <>
      <Header1 userId={userId} role="student" isFrozen={isFrozen}/>
      <Header/>
      <div style={pageStyle}>
        {/* soft background orbs only in dark mode */}
        {!isLight && (
          <>
            <motion.div
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
                filter: "blur(40px)",
                opacity: 0.5,
                top: -40,
                left: -60,
                mixBlendMode: "screen",
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
                background:
                  "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
                filter: "blur(34px)",
                opacity: 0.5,
                bottom: -40,
                right: -40,
                mixBlendMode: "screen",
                zIndex: 0,
              }}
              animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={cardStyle}
          >
            {/* Theme toggle (same UI, just works with new styles) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>Transaction Bill</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "6px 14px",
                  cursor: "pointer",
                  background: isLight ? "#0f172a" : "#e5e7eb",
                  color: isLight ? "#e5e7eb" : "#0f172a",
                  fontWeight: 600,
                }}
              >
                {isLight ? "Dark Mode" : "Light Mode"}
              </motion.button>
            </div>

            {/* User info */}
            <div style={{ marginBottom: 16, color: isLight ? "#111827" : "#e5e7eb" }}>
              <p>
                <b>Name:</b> {data.username}
              </p>
              <p>
                <b>User ID:</b> {data.userId}
              </p>
            </div>

            {/* Transactions Table */}
            {data.transactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  color: "#f87171",
                  textAlign: "center",
                  padding: 40,
                }}
              >
                No transactions found
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: isLight ? "#dbeafe" : "#1e293b",
                        color: isLight ? "#111827" : "#e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: 12,
                          borderBottom: "1px solid #9ca3af",
                          fontWeight: 600,
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: 12,
                          borderBottom: "1px solid #9ca3af",
                          fontWeight: 600,
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          padding: 12,
                          borderBottom: "1px solid #9ca3af",
                          fontWeight: 600,
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t, i) => {
                      const statusColor = getStatusColor(t.status);
                      return (
                        <tr
                          key={i}
                          style={{
                            textAlign: "center",
                            backgroundColor:
                              i % 2 === 0
                                ? isLight
                                  ? "#f9fafb"
                                  : "#111827"
                                : "transparent",
                            color: isLight ? "#111827" : "#e5e7eb",
                          }}
                        >
                          <td style={{ padding: 12 }}>
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: 12 }}>₹{t.amount}</td>
                          <td
                            style={{
                              padding: 12,
                              color: statusColor,
                              fontWeight: 600,
                            }}
                          >
                            {t.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <h3
                  style={{
                    marginTop: 8,
                    color: isLight ? "#111827" : "#e5e7eb",
                  }}
                >
                  Total Spent: ₹{totalSpent}
                </h3>

                {/* Generate Bill button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 16px 32px rgba(14,165,233,0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.print()}
                  style={{
                    marginTop: 16,
                    padding: "12px 28px",
                    borderRadius: 999,
                    border: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    color: "#fff",
                    background:
                      "linear-gradient(120deg,#0ea5e9,#22c55e,#16a34a)",
                    boxShadow:
                      "0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(37,99,235,0.25)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 160,
                    userSelect: "none",
                  }}
                >
                  Generate Bill
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default GenerateBill;
