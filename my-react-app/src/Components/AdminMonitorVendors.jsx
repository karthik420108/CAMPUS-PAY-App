import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react"; // Added for animations
import Header from "./Header.jsx";
import { useAlert } from "../context/AlertContext";

function AdminMonitorVendors() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // --- Original Logic State ---
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // --- New Visual State (From Target) ---
  const [theme, setTheme] = useState("light");
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showRedeemsModal, setShowRedeemsModal] = useState(false);
  const [modalVendor, setModalVendor] = useState(null);

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/monitor/vendors"
      );
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetails = async (vendorId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/admin/monitor/vendor/${vendorId}`
      );
      setSelectedVendor(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;
    const q = searchTerm.trim().toLowerCase();
    return vendors.filter((v) => {
      const matchesName = v.vendorName && v.vendorName.toLowerCase().includes(q);
      const matchesId = v.vendorid && v.vendorid.toLowerCase().includes(q);
      const matchesEmail = v.Email && v.Email.toLowerCase().includes(q);
      return matchesName || matchesId || matchesEmail;
    });
  }, [vendors, searchTerm]);

  const toggleFreeze = async (vendorId, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/monitor/vendor/${vendorId}/freeze`,
        { isFrozen: !currentStatus }
      );
      fetchVendors();
      if (selectedVendor && selectedVendor.vendor._id === vendorId) {
        fetchVendorDetails(vendorId);
      }
    } catch (err) {
      showAlert({
        type: "error",
        title: "Update Failed",
        message: "Failed to update vendor status"
      });
    }
  };

  const toggleSuspend = async (vendorId, currentStatus) => {
    try {
      const reason = currentStatus
        ? prompt("Enter reason for unsuspending:")
        : prompt("Enter reason for suspension:");

      if (reason === null) return;

      await axios.put(
        `http://localhost:5000/admin/monitor/vendor/${vendorId}/suspend`,
        {
          isSuspended: !currentStatus,
          reason: reason,
        }
      );
      fetchVendors();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Update Failed",
        message: "Failed to update vendor suspend status"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "success":
      case "SUCCESS":
        return "#22c55e"; // green-500
      case "pending":
      case "PENDING":
        return "#f59e0b"; // amber-500
      case "rejected":
      case "FAILED":
        return "#ef4444"; // red-500
      default:
        return isLight ? "#0f172a" : "#e5e7eb";
    }
  };

  const handleViewMoreTransactions = async (vendor) => {
    try {
      const res = await axios.get(`http://localhost:5000/admin/monitor/vendor/${vendor._id}`);
      setModalVendor(res.data);
      setShowTransactionsModal(true);
    } catch (err) {
      console.error("Error fetching full transactions:", err);
      showAlert({
        type: "error",
        title: "Fetch Failed",
        message: "Failed to fetch full transaction history"
      });
    }
  };

  const handleViewMoreRedeems = async (vendor) => {
    try {
      const res = await axios.get(`http://localhost:5000/admin/monitor/vendor/${vendor._id}`);
      setModalVendor(res.data);
      setShowRedeemsModal(true);
    } catch (err) {
      console.error("Error fetching full redeems:", err);
      showAlert({
        type: "error",
        title: "Fetch Failed",
        message: "Failed to fetch full redeem history"
      });
    }
  };

  const closeModal = () => {
    setShowTransactionsModal(false);
    setShowRedeemsModal(false);
    setModalVendor(null);
  };

  // --- Styling Constants (From Target) ---
  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";
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

  const tableHeaderStyle = {
    color: textSub,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "12px",
    textAlign: "left",
    borderBottom: isLight
      ? "1px solid rgba(0,0,0,0.1)"
      : "1px solid rgba(255,255,255,0.1)",
  };

  const tableCellStyle = {
    color: textMain,
    fontSize: "13px",
    padding: "12px",
    borderBottom: isLight
      ? "1px solid rgba(0,0,0,0.05)"
      : "1px solid rgba(255,255,255,0.05)",
  };

  const actionButtonStyle = {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    marginRight: "5px",
    transition: "all 0.2s",
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...pageStyle,
          color: textMain,
        }}
      >
        Loading...
      </div>
    );

  return (
    <>
      <Header
        title="Monitor Vendors"
        userRole="admin"
        userName="Admin"
      />

      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start", // changed from center to flex-start for long tables
          padding: "40px 16px",
          overflow: "hidden",
          position: "relative",
          ...pageStyle,
        }}
      >
        {/* Background Orbs */}
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
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
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
            padding: "26px 22px 20px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            position: "relative",
            overflow: "hidden", // Important for contained tables
            marginTop: "20px",
            ...cardStyle,
          }}
        >
          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 18,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 5px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 11,
              zIndex: 5,
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <button
              type="button"
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
            </button>
          </div>

          {/* Top Accent */}
          <motion.div
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              top: 10,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              opacity: 0.9,
            }}
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Header Section */}
          <div style={{ marginBottom: "20px", marginTop: "10px" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: textSub,
                marginBottom: 4,
              }}
            >
              Admin Dashboard
            </div>
            <h2
              style={{
                fontSize: 22,
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: textMain,
                margin: 0,
              }}
            >
              Vendor Monitor
            </h2>
            <div
              style={{
                height: 1,
                width: "100%",
                background: isLight
                  ? "linear-gradient(90deg,transparent,#dbeafe,#93c5fd,transparent)"
                  : "linear-gradient(90deg,transparent,#1e293b,#0f172a,transparent)",
                marginTop: 15,
                marginBottom: 20,
                borderRadius: 999,
              }}
            />
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: easingSoft }}
            style={{ marginBottom: 25, position: "relative", zIndex: 10 }}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "500px",
                margin: "0 auto",
                zIndex: 10,
              }}
            >
              <input
                type="text"
                placeholder="Search by Vendor Name, Vendor ID, or Email ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 45px 12px 18px",
                  borderRadius: "16px",
                  border: `2px solid ${isLight ? "rgba(148,163,184,0.5)" : "rgba(71,85,105,0.6)"}`,
                  background: isLight
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(15,23,42,0.8)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  fontSize: "14px",
                  color: isLight ? "#1e293b" : "#f1f5f9",
                  outline: "none",
                  transition: "all 0.3s ease",
                  zIndex: 10,
                  position: "relative",
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

          {/* Logic Content */}
          {!showDetails ? (
            <>
              {filteredVendors.length === 0 ? (
                <p style={{ color: textSub, textAlign: "center" }}>
                  {searchTerm.trim() ? "No matching vendors found" : "No vendors found"}
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Vendor Name</th>
                        <th style={tableHeaderStyle}>Vendor ID</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Wallet Balance</th>
                        <th style={tableHeaderStyle}>KYC Status</th>
                        <th style={tableHeaderStyle}>Freeze Status</th>
                        <th style={tableHeaderStyle}>Suspend Status</th>
                        <th style={tableHeaderStyle}>Trans.</th>
                        <th style={tableHeaderStyle}>Redeems</th>
                        <th style={tableHeaderStyle}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendors.map((vendor) => (
                        <tr key={vendor._id}>
                          <td style={tableCellStyle}>{vendor.vendorName}</td>
                          <td style={tableCellStyle}>{vendor.vendorid}</td>
                          <td style={tableCellStyle}>{vendor.Email}</td>
                          <td style={tableCellStyle}>
                            ₹{vendor.Wallet?.toFixed(4) || 0}
                          </td>
                          <td
                            style={{
                              ...tableCellStyle,
                              color: getStatusColor(vendor.kyc?.status),
                              fontWeight: "600",
                            }}
                          >
                            {vendor.kyc?.status || "pending"}
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                color: vendor.isFrozen ? "#ef4444" : "#22c55e",
                                fontWeight: "bold",
                                fontSize: "11px",
                                background: vendor.isFrozen
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(34,197,94,0.1)",
                                padding: "3px 8px",
                                borderRadius: "12px",
                              }}
                            >
                              {vendor.isFrozen ? "FROZEN" : "ACTIVE"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                color: vendor.isSuspended
                                  ? "#ef4444"
                                  : "#22c55e",
                                fontWeight: "bold",
                                fontSize: "11px",
                                background: vendor.isSuspended
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(34,197,94,0.1)",
                                padding: "3px 8px",
                                borderRadius: "12px",
                              }}
                            >
                              {vendor.isSuspended ? "SUSPENDED" : "ACTIVE"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            {vendor.totalTransactions || 0}
                          </td>
                          <td style={tableCellStyle}>
                            {vendor.totalRedeems || 0}
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => fetchVendorDetails(vendor._id)}
                                style={{
                                  ...actionButtonStyle,
                                  background: "#3b82f6",
                                  color: "white",
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  toggleFreeze(vendor._id, vendor.isFrozen)
                                }
                                style={{
                                  ...actionButtonStyle,
                                  background: vendor.isFrozen
                                    ? "#22c55e"
                                    : "#ef4444",
                                  color: "white",
                                }}
                              >
                                {vendor.isFrozen ? "Unfreeze" : "Freeze"}
                              </button>
                              <button
                                onClick={() =>
                                  toggleSuspend(vendor._id, vendor.isSuspended)
                                }
                                style={{
                                  ...actionButtonStyle,
                                  background: vendor.isSuspended
                                    ? "#22c55e"
                                    : "#f59e0b",
                                  color: "white",
                                }}
                              >
                                {vendor.isSuspended ? "Unsuspend" : "Suspend"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  marginBottom: "20px",
                  background: "transparent",
                  border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
                  color: textMain,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ← Back to List
              </button>

              {selectedVendor && (
                <div
                  style={{
                    border: `1px solid ${
                      isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
                    }`,
                    padding: "24px",
                    borderRadius: "16px",
                    background: isLight
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.2)",
                  }}
                >
                  <h3 style={{ marginTop: 0, color: textMain }}>
                    Vendor Details: {selectedVendor.vendor.vendorName}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "30px",
                      marginBottom: "30px",
                    }}
                  >
                    <div>
                      <h4 style={{ color: textSub, textTransform: "uppercase", fontSize: "12px" }}>Basic Info</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                        <p style={{ margin: 0 }}><strong>Vendor ID:</strong> {selectedVendor.vendor.vendorid}</p>
                        <p style={{ margin: 0 }}><strong>Email:</strong> {selectedVendor.vendor.Email}</p>
                        <p style={{ margin: 0 }}><strong>Wallet:</strong> ₹{selectedVendor.vendor.Wallet?.toFixed(4) || 0}</p>
                        <p style={{ margin: 0 }}>
                          <strong>KYC Status:</strong>{" "}
                          <span style={{ color: getStatusColor(selectedVendor.vendor.kyc?.status) }}>
                            {selectedVendor.vendor.kyc?.status || "pending"}
                          </span>
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Status:</strong>{" "}
                          <span style={{ color: selectedVendor.vendor.isFrozen ? "#ef4444" : "#22c55e", fontWeight: "bold" }}>
                            {selectedVendor.vendor.isFrozen ? "FROZEN" : "ACTIVE"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ color: textSub, textTransform: "uppercase", fontSize: "12px" }}>Statistics</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                        <p style={{ margin: 0 }}><strong>Total Transactions:</strong> {selectedVendor.stats.totalTransactions}</p>
                        <p style={{ margin: 0 }}><strong>Successful Transactions:</strong> {selectedVendor.stats.successfulTransactions}</p>
                        <p style={{ margin: 0 }}><strong>Total Redeems:</strong> {selectedVendor.stats.totalRedeems}</p>
                        <p style={{ margin: 0 }}><strong>Total Redeem Amount:</strong> ₹{selectedVendor.stats.totalRedeemAmount?.toFixed(4) || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Recent Transactions */}
                    <div>
                      <h4 style={{ color: textMain }}>Recent Transactions (Last 5)</h4>
                      {selectedVendor.transactions.length === 0 ? (
                        <p style={{ color: textSub }}>No transactions</p>
                      ) : (
                          <>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  <th style={{ ...tableHeaderStyle, padding: "8px" }}>Student</th>
                                  <th style={{ ...tableHeaderStyle, padding: "8px" }}>Amount</th>
                                  <th style={{ ...tableHeaderStyle, padding: "8px" }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedVendor.transactions
                                  .slice(0, 5)
                                  .map((tx, index) => (
                                    <tr key={index}>
                                      <td style={{ ...tableCellStyle, padding: "8px" }}>
                                        {tx.userId?.firstName} {tx.userId?.lastName}
                                      </td>
                                      <td style={{ ...tableCellStyle, padding: "8px" }}>₹{tx.amount}</td>
                                      <td style={{ ...tableCellStyle, padding: "8px", color: getStatusColor(tx.status) }}>
                                        {tx.status}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                            {selectedVendor.transactions.length > 5 && (
                              <div style={{ marginTop: "12px", textAlign: "center" }}>
                                <button
                                  onClick={() => handleViewMoreTransactions(selectedVendor.vendor)}
                                  style={{
                                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(59,130,246,0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  View All Transactions ({selectedVendor.transactions.length})
                                </button>
                              </div>
                            )}
                          </>
                        )}
                    </div>

                    {/* Recent Redeems */}
                    <div>
                      <h4 style={{ color: textMain }}>Recent Redeems (Last 5)</h4>
                      {selectedVendor.redeemRequests.length === 0 ? (
                        <p style={{ color: textSub }}>No redeem requests</p>
                      ) : (
                          <>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  <th style={{ ...tableHeaderStyle, padding: "8px" }}>Amount</th>
                                  <th style={{ ...tableHeaderStyle, padding: "8px" }}>Status</th>
                                  <th style={{ ...tableHeaderStyle, padding: "8px" }}>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedVendor.redeemRequests
                                  .slice(0, 5)
                                  .map((redeem, index) => (
                                    <tr key={index}>
                                      <td style={{ ...tableCellStyle, padding: "8px" }}>₹{redeem.amount}</td>
                                      <td style={{ ...tableCellStyle, padding: "8px", color: getStatusColor(redeem.status) }}>
                                        {redeem.status}
                                      </td>
                                      <td style={{ ...tableCellStyle, padding: "8px" }}>
                                        {new Date(redeem.date).toLocaleDateString()}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                            {selectedVendor.redeemRequests.length > 5 && (
                              <div style={{ marginTop: "12px", textAlign: "center" }}>
                                <button
                                  onClick={() => handleViewMoreRedeems(selectedVendor.vendor)}
                                  style={{
                                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 4px 12px rgba(139,92,246,0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  View All Redeems ({selectedVendor.redeemRequests.length})
                                </button>
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Transactions Modal */}
      <AnimatePresence>
        {showTransactionsModal && modalVendor && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: "90%", maxWidth: "800px", maxHeight: "80vh", padding: "24px", borderRadius: "16px", background: isLight ? "#fff" : "#1e293b", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", color: textMain, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: textMain }}>All Transactions - {modalVendor.vendor.vendorName}</h3>
                <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: textSub, padding: "0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }} onMouseEnter={(e) => { e.target.style.background = isLight ? "#f1f5f9" : "#334155"; }} onMouseLeave={(e) => { e.target.style.background = "none"; }}>&times;</button>
              </div>
              
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
                {(!modalVendor.transactions || modalVendor.transactions.length === 0) ? (
                  <p style={{ color: textSub, fontSize: 13, textAlign: "center", padding: "40px" }}>No transactions found.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: isLight ? "#fff" : "#1e293b", zIndex: 10 }}>
                      <tr>
                        <th style={{ ...tableHeaderStyle, padding: "12px 8px" }}>Date</th>
                        <th style={{ ...tableHeaderStyle, padding: "12px 8px" }}>Student</th>
                        <th style={{ ...tableHeaderStyle, padding: "12px 8px" }}>Amount</th>
                        <th style={{ ...tableHeaderStyle, padding: "12px 8px" }}>Status</th>
                        <th style={{ ...tableHeaderStyle, padding: "12px 8px" }}>TXN ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalVendor.transactions.map((tx, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}` }}>
                          <td style={{ ...tableCellStyle, padding: "12px 8px", fontSize: "12px" }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ ...tableCellStyle, padding: "12px 8px", fontSize: "12px" }}>{tx.userId?.firstName} {tx.userId?.lastName || 'N/A'}</td>
                          <td style={{ ...tableCellStyle, padding: "12px 8px", fontSize: "12px", fontWeight: 600 }}>₹{tx.amount || '0.00'}</td>
                          <td style={{ ...tableCellStyle, padding: "12px 8px", fontSize: "12px", color: getStatusColor(tx.status) }}>{tx.status || 'PENDING'}</td>
                          <td style={{ ...tableCellStyle, padding: "12px 8px", fontSize: "11px", color: textSub, fontFamily: "monospace" }}>{tx.txid || tx._id?.substring(0,8) || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: textSub }}>Total: {modalVendor.transactions.length} transactions</span>
                <button onClick={closeModal} style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redeems Modal */}
      <AnimatePresence>
        {showRedeemsModal && modalVendor && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: "90%", maxWidth: "800px", maxHeight: "80vh", padding: "24px", borderRadius: "16px", background: isLight ? "#fff" : "#1e293b", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", color: textMain, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: textMain }}>All Redeem Requests - {modalVendor.vendor.vendorName}</h3>
                <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: textSub, padding: "0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }} onMouseEnter={(e) => { e.target.style.background = isLight ? "#f1f5f9" : "#334155"; }} onMouseLeave={(e) => { e.target.style.background = "none"; }}>&times;</button>
              </div>
              
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
                {(!modalVendor.redeemRequests || modalVendor.redeemRequests.length === 0) ? (
                  <p style={{ color: textSub, fontSize: 13, textAlign: "center", padding: "40px" }}>No redeem requests found.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {modalVendor.redeemRequests.map((redeem, i) => (
                      <div key={i} style={{ padding: "16px", borderRadius: "12px", border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, background: isLight ? "#f8fafc" : "#0f172a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: getStatusColor(redeem.status), color: "#fff" }}>
                              {redeem.status?.toUpperCase()}
                            </span>
                            <span style={{ fontSize: "12px", color: textSub, fontFamily: "monospace" }}>#{redeem._id?.substring(0,8) || 'N/A'}</span>
                          </div>
                          <span style={{ fontSize: "11px", color: textSub }}>{redeem.date ? new Date(redeem.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: textMain }}>₹{redeem.amount || '0.00'}</span>
                          {redeem.status === 'pending' && (
                            <span style={{ fontSize: "11px", color: textSub }}>Awaiting approval</span>
                          )}
                        </div>
                        
                        {redeem.upiId && (
                          <div style={{ marginTop: "8px", fontSize: "11px", color: textSub }}>
                            <strong>UPI ID:</strong> {redeem.upiId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: textSub }}>Total: {modalVendor.redeemRequests.length} redeem requests</span>
                <button onClick={closeModal} style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminMonitorVendors;
