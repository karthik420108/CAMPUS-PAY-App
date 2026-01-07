import { useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header1 from "./Header1";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import Header from "./Header3"

function GenerateBill() {
  const { state } = useLocation();
  const { userId} = state || {};
  const navigate = useNavigate();

  const [data, setData] = useState(null);
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

      // Handle redirects
     
      if (isSuspended) {
        setBlockingMessage("Your account is suspended. Redirecting to homepage...");
        setTimeout(() => navigate("/", { state: { userId } }), 2500);
        return;
      }

      // Fetch transactions only if not blocked
      const txnRes = await axios.get(`http://localhost:5000/transactions/${userId}`);
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

if (blockingMessage) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 18,
      fontWeight: 600,
      color: "#ef4444",
    }}>
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

  const pageStyle = isLight
    ? { backgroundColor: "#f3f4f6", minHeight: "100vh", padding: 32 }
    : { backgroundColor: "#020617", minHeight: "100vh", padding: 32, color: "#e5e7eb" };

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
        boxShadow: "0 16px 38px rgba(0,0,0,0.85)",
        color: "#e5e7eb",
        width: "100%",
        maxWidth: 900,
      };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "success" || s === "completed") return "#22c55e";
    if (s === "pending") return "#f59e0b";
    return "#ef4444"; // refund/fail
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: 50, color: isLight ? "#6b7280" : "#94a3b8" }}>
        Loading bill...
      </p>
    );

  if (!data || !data.transactions)
    return (
      <p style={{ textAlign: "center", marginTop: 50, color: "#f87171" }}>
        No data available.
      </p>
    );

  return (
    <>
      <Header1 userId={userId} role="student" isFrozen={isFrozen}/>
        <Header theme={theme} setTheme={setTheme} /> 
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
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

      <div style={pageStyle}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={cardStyle}
        >
          {/* Theme toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Transaction Bill</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
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
          <div style={{ marginBottom: 16 }}>
            <p><b>Name:</b> {data.username}</p>
            <p><b>User ID:</b> {data.userId}</p>
          </div>

          {/* Transactions Table */}
          {data.transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: "#f87171", textAlign: "center", padding: 40 }}
            >
              No transactions found
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: isLight ? "#dbeafe" : "#1e293b" }}>
                    <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>Date</th>
                    
                    <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>Amount</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t, i) => {
                    const statusColor = getStatusColor(t.status);
                    return (
                      <tr key={i} style={{ textAlign: "center", backgroundColor: i % 2 === 0 ? (isLight ? "#f9fafb" : "#111827") : "transparent" }}>
                        <td style={{ padding: 12 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                       
                        <td style={{ padding: 12 }}>₹{t.amount}</td>
                        <td style={{ padding: 12, color: statusColor, fontWeight: 600 }}>{t.status}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <h3 style={{ marginTop: 8 }}>Total Spent: ₹{totalSpent}</h3>

              {/* Generate Bill button */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 16px 32px rgba(14,165,233,0.4)" }}
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
                  background: "linear-gradient(120deg,#0ea5e9,#22c55e,#16a34a)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(37,99,235,0.25)",
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
    </>
  );
}

export default GenerateBill;
