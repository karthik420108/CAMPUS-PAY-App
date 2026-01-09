import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header.jsx";
import API_CONFIG from "../config/api";

function AdminRedeemHistory() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // --- State ---
  const [redeems, setRedeems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [theme, setTheme] = useState("light");

  const fetchRedeemHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axios.get(
        API_CONFIG.getUrl(`/admin/redeem-history?${params.toString()}`)
      );
      setRedeems(res.data);
    } catch (err) {
      console.error("Error fetching redeem history:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, startDate, endDate]);

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }
    fetchRedeemHistory();
  }, [state, navigate, fetchRedeemHistory]);

  useEffect(() => {
    if (state && state.role === "admin") {
      fetchRedeemHistory();
    }
  }, [fetchRedeemHistory, state]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return theme === "light" ? "#22c55e" : "#10b981";
      case "FAILED":
        return theme === "light" ? "#ef4444" : "#f87171";
      case "PENDING":
        return theme === "light" ? "#f59e0b" : "#fbbf24";
      default:
        return theme === "light" ? "#6b7280" : "#9ca3af";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "SUCCESS":
        return theme === "light" ? "rgba(34, 197, 94, 0.1)" : "rgba(16, 185, 129, 0.2)";
      case "FAILED":
        return theme === "light" ? "rgba(239, 68, 68, 0.1)" : "rgba(248, 113, 113, 0.2)";
      case "PENDING":
        return theme === "light" ? "rgba(245, 158, 11, 0.1)" : "rgba(251, 191, 36, 0.2)";
      default:
        return theme === "light" ? "rgba(107, 114, 128, 0.1)" : "rgba(156, 163, 175, 0.2)";
    }
  };

  // --- STYLING CONSTANTS ---
  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

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

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
    background: isLight ? "white" : "rgba(30, 41, 59, 0.8)",
    color: textMain,
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

  const buttonStyle = {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: isLight 
      ? "linear-gradient(135deg, #3b82f6, #2563eb)" 
      : "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
  };

  if (loading)
    return (
      <div
        style={{
          ...pageStyle,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textMain,
        }}
      >
        Loading...
      </div>
    );

  return (
    <>
      <Header title="Redeem Requests History" userRole="admin" userName="Admin" />

      <motion.div
        style={{
          ...pageStyle,
          minHeight: "100vh",
          padding: "40px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
              : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
            filter: "blur(60px)",
            opacity: 0.4,
            top: -50,
            left: -50,
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: "1400px",
            borderRadius: 28,
            padding: "30px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            position: "relative",
            marginTop: "20px",
            ...cardStyle,
          }}
        >
          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 6px",
              borderRadius: 999,
              border: `1px solid ${
                isLight ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.4)"
              }`,
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.8)",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 11, color: textSub, paddingLeft: 4 }}>
              Mode
            </span>
            <button
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              style={{
                border: "none",
                borderRadius: 999,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                background: isLight
                  ? "linear-gradient(120deg,#020617,#0f172a)"
                  : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
                color: isLight ? "#e5e7eb" : "#0f172a",
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>

          {/* Header Section */}
          <div style={{ marginBottom: "25px" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: textSub,
                marginBottom: 6,
              }}
            >
              Admin Dashboard
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: textMain,
                margin: 0,
              }}
            >
              Redeem Requests History
            </h2>
            <div
              style={{
                height: 2,
                width: "100%",
                background:
                  "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
                marginTop: 15,
                opacity: 0.8,
                borderRadius: 999,
              }}
            />
          </div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              ...cardStyle,
              padding: "20px",
              marginBottom: "25px",
              borderRadius: "16px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: textMain, margin: 0 }}>
                Search & Filters
              </h3>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "16px"
            }}>
              <input
                type="text"
                placeholder="Search by vendor, amount, IFSC, account..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Approved</option>
                <option value="FAILED">Rejected</option>
              </select>
              
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
              
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={clearFilters}
                style={{
                  ...buttonStyle,
                  background: isLight ? "#f3f4f6" : "rgba(30, 41, 59, 0.8)",
                  color: textMain,
                  border: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
                }}
              >
                Clear Filters
              </button>
              
              <div style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: isLight ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.2)",
                color: isLight ? "#1e40af" : "#60a5fa",
                fontSize: "14px",
                fontWeight: 500,
              }}>
                Total Results: {redeems.length}
              </div>
            </div>
          </motion.div>

          {/* Results Table */}
          <AnimatePresence mode="wait">
            {redeems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: textSub,
                  background: isLight ? "rgba(255,255,255,0.4)" : "transparent",
                  borderRadius: "12px",
                }}
              >
                No redeem requests found matching your criteria
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ overflowX: "auto" }}
              >
                <table
                  style={{ width: "100%", borderCollapse: "collapse" }}
                  cellPadding={0}
                  cellSpacing={0}
                >
                  <thead>
                    <tr>
                      <th style={{
                        color: textSub,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                      }}>Vendor Details</th>
                      <th style={{
                        color: textSub,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                      }}>Amount</th>
                      <th style={{
                        color: textSub,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                      }}>Bank Details</th>
                      <th style={{
                        color: textSub,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                      }}>Date & Time</th>
                      <th style={{
                        color: textSub,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                      }}>Status</th>
                      <th style={{
                        color: textSub,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
                      }}>Closing Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {redeems.map((r) => (
                      <tr
                        key={r._id}
                        style={{
                          borderBottom: isLight
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td style={{
                          color: textMain,
                          fontSize: "13px",
                          padding: "16px",
                          borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
                          verticalAlign: "middle",
                        }}>
                          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                            {r.userId?.vendorName || "Unknown Vendor"}
                          </div>
                          <div style={{ fontSize: "12px", color: textSub, lineHeight: "1.4" }}>
                            <div>ID: {r.userId?._id || "N/A"}</div>
                            <div>{r.userId?.Email || "No email"}</div>
                            <div>{r.userId?.Phone || "No phone"}</div>
                          </div>
                        </td>
                        <td style={{
                          color: textMain,
                          fontSize: "13px",
                          padding: "16px",
                          borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
                          verticalAlign: "middle",
                        }}>
                          <span
                            style={{
                              color: isLight ? "#0f172a" : "#e5e7eb",
                              fontWeight: "bold",
                              fontSize: "15px",
                            }}
                          >
                            ₹{r.amount}
                          </span>
                        </td>
                        <td style={{
                          color: textMain,
                          fontSize: "13px",
                          padding: "16px",
                          borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
                          verticalAlign: "middle",
                          fontFamily: "monospace",
                        }}>
                          <div style={{ marginBottom: "4px" }}>
                            <strong>IFSC:</strong> {r.Ifsc}
                          </div>
                          <div>
                            <strong>Acc:</strong> {r.Acc}
                          </div>
                        </td>
                        <td style={{
                          color: textMain,
                          fontSize: "13px",
                          padding: "16px",
                          borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
                          verticalAlign: "middle",
                        }}>
                          <div style={{ color: textSub }}>
                            {new Date(r.date).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: "12px", color: textSub }}>
                            {new Date(r.date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td style={{
                          color: textMain,
                          fontSize: "13px",
                          padding: "16px",
                          borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
                          verticalAlign: "middle",
                        }}>
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 600,
                              background: getStatusBg(r.status),
                              color: getStatusColor(r.status),
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{
                          color: textMain,
                          fontSize: "13px",
                          padding: "16px",
                          borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
                          verticalAlign: "middle",
                        }}>
                          <span style={{ fontWeight: 600 }}>
                            ₹{r.closingBalance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}

export default AdminRedeemHistory;
