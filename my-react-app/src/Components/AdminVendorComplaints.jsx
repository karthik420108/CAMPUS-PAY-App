import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";

function AdminVendorComplaints() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [theme, setTheme] = useState("light");

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];

  // --- STYLING CONSTANTS ---
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
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }
    : {
        background: "rgba(30, 41, 59, 0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
      };

  const buttonStyleBase = {
    padding: "8px 16px", 
    borderRadius: "10px", 
    fontSize: "13px", 
    fontWeight: "600", 
    cursor: "pointer", 
    border: "none", 
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px"
  };

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate(-1);
      return;
    }

    const fetchComplaints = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin/vendor-complaints");
        setComplaints(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vendor complaints:", err);
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [state, navigate]);

  const handleResponse = async (complaintId) => {
    if (!responseText.trim()) {
      alert("Please enter a response message");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/admin/complaint/${complaintId}/respond`, {
        response: responseText
      });
      
      const response = await axios.get("http://localhost:5000/admin/vendor-complaints");
      setComplaints(response.data);
      
      setRespondingTo(null);
      setResponseText("");
    } catch (err) {
      console.error("Error sending response:", err);
      alert("Failed to send response");
    }
  };

  if (loading) {
    return (
      <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: textSub, fontWeight: 600 }}>Loading vendor complaints...</span>
      </div>
    );
  }

  const pendingComplaints = complaints.filter(c => c.status !== "resolved");
  const resolvedComplaints = complaints.filter(c => c.status === "resolved");
  const currentComplaints = activeTab === "pending" ? pendingComplaints : resolvedComplaints;
  
  // Apply search filter to current complaints
  const filteredCurrentComplaints = useMemo(() => {
    if (!searchTerm.trim()) return currentComplaints;
    const q = searchTerm.trim().toLowerCase();
    return currentComplaints.filter((c) => {
      const complaintId = c.complaintId || c._id || "";
      const matchesId = String(complaintId).toLowerCase().includes(q);
      return matchesId;
    });
  }, [currentComplaints, searchTerm]);

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
       {/* Background Orbs */}
       <motion.div
        style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)" : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
          filter: "blur(60px)", opacity: 0.4, top: -50, left: -50, zIndex: 0, pointerEvents: "none"
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      <div style={{ position: "relative", zIndex: 100 }}>
        <Header title="Vendor Complaints" userRole="admin" userName="Admin" />
      </div>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: "20px" }}>
            <div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: textMain, margin: 0 }}>Vendor Complaints</h2>
                <p style={{ color: textSub, marginTop: "4px" }}>Manage and respond to issues raised by vendors</p>
            </div>
            
            {/* Theme Toggle - EXACT MATCH from RaiseComplaint */}
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
                    backdropFilter: "blur(8px)",
                }}
            >
                <span style={{ color: "#6b7280", paddingLeft: 4 }}>Mode</span>
                <button
                    type="button"
                    onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
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

        {/* Search Bar - Top Center */}
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: easingSoft }}
            style={{ marginBottom: 24, position: "relative", zIndex: 10 }}
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
                    placeholder="Search by Complaint ID"
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
                        e.target.style.borderColor = isLight ? "rgba(148,163,184,0.5)" : "rgba(71,85,105,0.6)";
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", justifyContent: "center" }}>
            <button
                onClick={() => setActiveTab("pending")}
                style={{
                    ...buttonStyleBase,
                    background: activeTab === "pending" ? (isLight ? "#0f172a" : "#f8fafc") : (isLight ? "white" : "rgba(30,41,59,0.5)"),
                    color: activeTab === "pending" ? (isLight ? "white" : "#0f172a") : textSub,
                    border: activeTab === "pending" ? "none" : `1px solid ${isLight ? "#e2e8f0" : "#334155"}`,
                    boxShadow: activeTab === "pending" ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
                }}
            >
                ⏳ Pending ({pendingComplaints.length})
            </button>
            <button
                onClick={() => setActiveTab("resolved")}
                style={{
                    ...buttonStyleBase,
                    background: activeTab === "resolved" ? "#10b981" : (isLight ? "white" : "rgba(30,41,59,0.5)"),
                    color: activeTab === "resolved" ? "white" : textSub,
                    border: activeTab === "resolved" ? "none" : `1px solid ${isLight ? "#e2e8f0" : "#334155"}`,
                    boxShadow: activeTab === "resolved" ? "0 4px 12px rgba(16,185,129,0.2)" : "none"
                }}
            >
                ✅ Resolved ({resolvedComplaints.length})
            </button>
        </div>

        <AnimatePresence mode="wait">
            {filteredCurrentComplaints.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ ...cardStyle, padding: "40px", borderRadius: "16px", textAlign: "center", color: textSub }}
                >
                    {searchTerm.trim() ? 
                        (activeTab === "pending" ? "No matching pending complaints found." : "No matching resolved complaints found.") :
                        (activeTab === "pending" ? "No pending complaints found." : "No resolved complaints found.")
                    }
                </motion.div>
            ) : (
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, ease: easingSoft }}
                    style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                    {filteredCurrentComplaints.map((complaint) => (
                        <div 
                            key={complaint._id} 
                            style={{ 
                                ...cardStyle, 
                                padding: "24px", 
                                borderRadius: "16px", 
                                position: "relative",
                                overflow: "hidden" 
                            }}
                        >
                            {/* Left accent border */}
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: complaint.status === "resolved" ? "#10b981" : "#f59e0b" }}></div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: "300px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: "700", color: textSub, letterSpacing: "0.05em" }}>#{complaint.complaintId}</span>
                                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: isLight ? "#f1f5f9" : "#1e293b", color: textSub, fontWeight: "600" }}>VENDOR</span>
                                    </div>
                                    
                                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                                        <h3 style={{ margin: 0, fontSize: "16px", color: textMain }}>{complaint.userId?.vendorName || "Unknown Vendor"}</h3>
                                        <span style={{ fontSize: "13px", color: textSub }}>({complaint.userId?.Email})</span>
                                    </div>

                                    <p style={{ margin: "0 0 16px 0", fontSize: "15px", lineHeight: "1.6", color: textMain }}>
                                        {complaint.description}
                                    </p>

                                    {complaint.screenshot && (
                                        <div style={{ marginBottom: "16px" }}>
                                            <div style={{ fontSize: "12px", fontWeight: "600", color: textSub, marginBottom: "6px" }}>ATTACHMENT</div>
                                            <img 
                                                src={complaint.screenshot} 
                                                alt="Screenshot" 
                                                style={{ height: "100px", borderRadius: "8px", border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, cursor: "zoom-in" }}
                                                onClick={() => window.open(complaint.screenshot, "_blank")}
                                            />
                                        </div>
                                    )}

                                    {complaint.response && (
                                        <div style={{ padding: "16px", borderRadius: "12px", background: isLight ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.2)" }}>
                                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#059669", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span>✓ ADMIN RESPONSE</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "14px", color: isLight ? "#065f46" : "#34d399" }}>{complaint.response}</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", minWidth: "200px" }}>
                                    <div style={{ fontSize: "12px", color: textSub }}>{new Date(complaint.createdAt).toLocaleDateString()}</div>
                                    
                                    {complaint.status !== "resolved" && (
                                        <div style={{ width: "100%" }}>
                                            {respondingTo === complaint._id ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{ display: "flex", flexDirection: "column", gap: "10px", background: isLight ? "#f8fafc" : "#1e293b", padding: "12px", borderRadius: "12px", border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}` }}
                                                >
                                                    <textarea
                                                        value={responseText}
                                                        onChange={(e) => setResponseText(e.target.value)}
                                                        placeholder="Write your response..."
                                                        style={{ 
                                                            width: "100%", padding: "10px", borderRadius: "8px", 
                                                            border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
                                                            background: isLight ? "white" : "#0f172a",
                                                            color: textMain,
                                                            minHeight: "80px",
                                                            fontSize: "13px",
                                                            outline: "none"
                                                        }}
                                                        autoFocus
                                                    />
                                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                        <button 
                                                            onClick={() => setRespondingTo(null)}
                                                            style={{ ...buttonStyleBase, background: "transparent", color: textSub, border: `1px solid ${isLight ? "#e2e8f0" : "#475569"}` }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResponse(complaint._id)}
                                                            style={{ ...buttonStyleBase, background: "#10b981", color: "white" }}
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <button
                                                    onClick={() => setRespondingTo(complaint._id)}
                                                    style={{ 
                                                        ...buttonStyleBase, 
                                                        background: isLight ? "#eff6ff" : "rgba(59,130,246,0.15)", 
                                                        color: "#3b82f6", 
                                                        width: "100%",
                                                        border: "1px solid rgba(59,130,246,0.3)"
                                                    }}
                                                >
                                                    💬 Respond
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminVendorComplaints;
