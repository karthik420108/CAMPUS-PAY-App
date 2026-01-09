import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";
import { useAlert } from "../context/AlertContext";
import API_CONFIG from "../config/api";

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [theme, setTheme] = useState("light");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate(-1);
      return;
    }

    const fetchForwardedComplaints = async () => {
      try {
        const response = await axios.get(API_CONFIG.getUrl("/admin/forwarded-complaints"));
        console.log("Fetched forwarded complaints:", response.data);
        setComplaints(response.data);
        setAllComplaints(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching forwarded complaints:", err);
        setLoading(false);
      }
    };

    fetchForwardedComplaints();
  }, [state, navigate]);

  // Search functionality
  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);
    
    if (searchValue.trim() === "") {
      // If search is empty, show all complaints
      setComplaints(allComplaints);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(API_CONFIG.getUrl(`/admin/forwarded-complaints/search?query=${encodeURIComponent(searchValue.trim())}`));
      console.log("Search results:", response.data);
      setComplaints(response.data);
    } catch (err) {
      console.error("Error searching complaints:", err);
      // If search fails, fall back to client-side filtering
      const filtered = allComplaints.filter(complaint => 
        complaint.complaintId.toLowerCase().includes(searchValue.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        (complaint.response && complaint.response.toLowerCase().includes(searchValue.toLowerCase()))
      );
      setComplaints(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setComplaints(allComplaints);
  };

  const handleResponse = async (complaintId) => {
    if (!responseText.trim()) {
      showAlert({
        type: "warning",
        title: "Missing Response",
        message: "Please enter a response message"
      });
      return;
    }

    try {
      await axios.post(API_CONFIG.getUrl(`/admin/complaint/${complaintId}/respond`), {
        response: responseText
      });
      
      // Refresh complaints list
      const response = await axios.get(API_CONFIG.getUrl("/admin/forwarded-complaints"));
      setAllComplaints(response.data);
      setComplaints(searchTerm ? response.data.filter(complaint => 
        complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (complaint.response && complaint.response.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : response.data);
      
      setRespondingTo(null);
      setResponseText("");
      showAlert({
        type: "success",
        title: "Response Sent",
        message: "Response sent successfully!"
      });
    } catch (err) {
      console.error("Error sending response:", err);
      showAlert({
        type: "error",
        title: "Send Failed",
        message: "Failed to send response"
      });
    }
  };

  const getStatusColor = (status) => {
    return status === "resolved" ? "#10b981" : "#f59e0b";
  };

  const handleViewScreenshot = (screenshotUrl, complaint) => {
    navigate("/screenshot-viewer", {
      state: {
        screenshotUrl: screenshotUrl,
        complaintId: complaint.complaintId,
        studentName: complaint.studentName 
          ? `${complaint.studentName.firstName || ""} ${complaint.studentName.lastName || ""}`.trim()
          : "Unknown Student"
      }
    });
  };

  // --- STYLING CONSTANTS ---
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
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }
    : {
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
      };

  const inputStyle = isLight 
    ? { background: "white", border: "1px solid #e2e8f0", color: textMain }
    : { background: "rgba(15, 23, 42, 0.6)", border: "1px solid #334155", color: "white" };

  if (loading) {
    return (
      <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: "20px", fontWeight: "600", color: textSub }}
        >
            Loading forwarded complaints...
        </motion.div>
      </div>
    );
  }

  // Separate complaints by status
  const pendingComplaints = complaints.filter(c => c.status !== "resolved");
  const resolvedComplaints = complaints.filter(c => c.status === "resolved");

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Background Orbs */}
      <motion.div
        style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)" : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
          top: "10%", left: "-5%", opacity: 0.4, filter: "blur(40px)"
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Theme Switch */}
      <div
        style={{
          position: "fixed", top: 20, right: 20, display: "flex", alignItems: "center", gap: 6,
          padding: "4px 6px", borderRadius: 999, border: "1px solid rgba(148,163,184,0.6)",
          background: isLight ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)", zIndex: 50,
        }}
      >
        <span style={{ color: textSub, paddingLeft: 4, fontSize: 12 }}>Mode</span>
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          style={{
            border: "none", borderRadius: 999, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: isLight ? "linear-gradient(120deg,#020617,#0f172a)" : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
            color: isLight ? "#e5e7eb" : "#0f172a",
          }}
        >
          {isLight ? "Dark" : "Light"}
        </button>
      </div>

      <div style={{ position: "relative", zIndex: 100 }}>
        <Header title="Student Complaints" userRole="admin" userName="Admin" />
      </div>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: textMain, margin: 0 }}>Student Complaints</h2>
                <p style={{ color: textSub, marginTop: "4px" }}>Forwarded student complaints that need your attention</p>
            </div>
        </div>

        {/* Search Bar */}
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
                    placeholder="Search by Complaint ID, description, or response..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
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
                            onClick={clearSearch}
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
                {isSearching && (
                    <div
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: isLight ? "#3b82f6" : "#60a5fa",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        🔍
                    </div>
                )}
            </div>
        </motion.div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ ...cardStyle, padding: "20px", borderRadius: "16px", textAlign: "center" }}
            >
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#f59e0b" }}>{pendingComplaints.length}</div>
                <div style={{ fontSize: "14px", color: textSub, fontWeight: "600" }}>Pending Response</div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ ...cardStyle, padding: "20px", borderRadius: "16px", textAlign: "center" }}
            >
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}>{resolvedComplaints.length}</div>
                <div style={{ fontSize: "14px", color: textSub, fontWeight: "600" }}>Resolved</div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ ...cardStyle, padding: "20px", borderRadius: "16px", textAlign: "center" }}
            >
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#3b82f6" }}>{complaints.length}</div>
                <div style={{ fontSize: "14px", color: textSub, fontWeight: "600" }}>Total Forwarded</div>
            </motion.div>
        </div>

        {complaints.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px", color: textSub, ...cardStyle, borderRadius: "20px" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 8px 0", color: textMain }}>
              {searchTerm ? "No Matching Complaints" : "No Student Complaints"}
            </h3>
            <p style={{ fontSize: "16px", margin: 0 }}>
              {searchTerm 
                ? `No student complaints found matching "${searchTerm}"`
                : "No student complaints have been forwarded by SubAdmins yet."
              }
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <AnimatePresence>
                {complaints.map((complaint) => (
                <motion.div 
                    layout
                    key={complaint._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: easingSoft }}
                    style={{ 
                        ...cardStyle, 
                        borderRadius: "20px", 
                        padding: "24px",
                        position: "relative",
                        borderLeft: `4px solid ${getStatusColor(complaint.status)}`
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Header Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: textSub, textTransform: "uppercase", letterSpacing: "0.05em" }}>ID: {complaint.complaintId}</span>
                                    <span style={{ 
                                        fontSize: "10px", fontWeight: "700", color: "#ef4444", 
                                        background: isLight ? "#fee2e2" : "rgba(127,29,29,0.3)", 
                                        padding: "2px 6px", borderRadius: "4px" 
                                    }}>
                                        FORWARDED
                                    </span>
                                    <span style={{ 
                                        fontSize: "10px", fontWeight: "700", color: "#10b981", 
                                        background: isLight ? "#d1fae5" : "rgba(16,185,129,0.3)", 
                                        padding: "2px 6px", borderRadius: "4px" 
                                    }}>
                                        STUDENT
                                    </span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: textMain }}>
                                    From: {complaint.userId ? (
                                        `${complaint.userId.firstName || "Unknown"} ${complaint.userId.lastName || ""} (${complaint.userId.collegeEmail || "N/A"})`
                                    ) : (
                                        <span style={{ color: "#ef4444" }}>
                                            Student information not available
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <div style={{ fontSize: "13px", color: textSub, fontWeight: "500" }}>
                                {new Date(complaint.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                        </div>

                        {/* Forwarded Info Box */}
                        {complaint.forwardedBy && (
                            <div style={{ 
                                background: isLight ? "#fff7ed" : "rgba(124, 45, 18, 0.2)", 
                                border: `1px solid ${isLight ? "#ffedd5" : "#7c2d12"}`,
                                padding: "10px 14px", borderRadius: "10px", fontSize: "13px", color: isLight ? "#9a3412" : "#fdba74"
                            }}>
                                <strong>↪ Forwarded by:</strong> {complaint.forwardedBy.name} ({complaint.forwardedBy.email})
                                {complaint.forwardedAt && (
                                    <span style={{ opacity: 0.8 }}> • {new Date(complaint.forwardedAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        )}

                        {/* Content Body */}
                        <div style={{ color: textMain, lineHeight: "1.6", fontSize: "15px" }}>
                            {complaint.description}
                        </div>

                        {/* Screenshot */}
                        {complaint.screenshot && (
                            <div>
                                <div style={{ fontSize: "12px", fontWeight: "600", color: textSub, marginBottom: "6px" }}>ATTACHMENT</div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px",
                                    background: isLight
                                      ? "rgba(241, 245, 249, 0.8)"
                                      : "rgba(15, 23, 42, 0.4)",
                                    borderRadius: "12px",
                                    border: `1px solid ${
                                      isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
                                    }`,
                                  }}
                                >
                                  <span style={{ 
                                    color: textSub, 
                                    fontSize: "14px",
                                    fontWeight: 500 
                                  }}>
                                    📸 Screenshot available
                                  </span>
                                  <button
                                    onClick={() => handleViewScreenshot(complaint.screenshot, complaint)}
                                    style={{
                                      padding: "6px 12px",
                                      background: "rgba(59, 130, 246, 0.15)",
                                      color: "#3b82f6",
                                      border: "1px solid rgba(59, 130, 246, 0.3)",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.background = "rgba(59, 130, 246, 0.25)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.background = "rgba(59, 130, 246, 0.15)";
                                    }}
                                  >
                                    👁️ View Screenshot
                                  </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Admin Response Display */}
                        {complaint.response && (
                            <div style={{ 
                                marginTop: "5px", padding: "16px", 
                                backgroundColor: isLight ? "#ecfdf5" : "rgba(6, 78, 59, 0.3)", 
                                border: `1px solid ${isLight ? "#d1fae5" : "#065f46"}`,
                                borderRadius: "12px" 
                            }}>
                                <div style={{ color: "#059669", fontSize: "12px", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase" }}>✅ Admin Response</div>
                                <p style={{ margin: 0, fontSize: "14px", color: isLight ? "#047857" : "#d1fae5" }}>{complaint.response}</p>
                            </div>
                        )}

                        {/* Action Area */}
                        <div style={{ marginTop: "10px", paddingTop: "15px", borderTop: isLight ? "1px solid #f1f5f9" : "1px solid #1e293b" }}>
                            {complaint.status !== "resolved" ? (
                                <AnimatePresence mode="wait">
                                    {respondingTo === complaint._id ? (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                                        >
                                            <textarea
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                placeholder="Write your resolution message here..."
                                                style={{
                                                    ...inputStyle,
                                                    width: "100%", padding: "12px", borderRadius: "8px", 
                                                    minHeight: "100px", resize: "vertical", outline: "none"
                                                }}
                                                autoFocus
                                            />
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button
                                                    onClick={() => handleResponse(complaint._id)}
                                                    style={{
                                                        padding: "8px 16px", backgroundColor: "#10b981", color: "white",
                                                        border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px"
                                                    }}
                                                >
                                                    Send Response
                                                </button>
                                                <button
                                                    onClick={() => { setRespondingTo(null); setResponseText(""); }}
                                                    style={{
                                                        padding: "8px 16px", backgroundColor: isLight ? "#e5e7eb" : "#334155", 
                                                        color: textMain, border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px"
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={() => setRespondingTo(complaint._id)}
                                                style={{
                                                    padding: "8px 20px",
                                                    backgroundColor: "#3b82f6",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontWeight: "600",
                                                    fontSize: "14px",
                                                    display: "flex", alignItems: "center", gap: "6px",
                                                    boxShadow: "0 2px 4px rgba(59,130,246,0.3)"
                                                }}
                                            >
                                                💬 Respond
                                            </button>
                                        </div>
                                    )}
                                </AnimatePresence>
                            ) : (
                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: "600", fontSize: "14px" }}>
                                    <span>🎉</span> Case Closed
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminComplaints;
