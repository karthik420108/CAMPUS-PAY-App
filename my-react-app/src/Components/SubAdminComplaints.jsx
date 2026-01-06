import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";

function SubAdminComplaints({ state }) {
  const navigate = useNavigate();

  // --- Original Logic State ---
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "resolved", or "forwarded"
  const [searchTerm, setSearchTerm] = useState("");
  const [responseModal, setResponseModal] = useState({
    isOpen: false,
    complaintId: null,
    response: "",
  });

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  const [forwardedComplaints, setForwardedComplaints] = useState([]);

  const fetchComplaints = useCallback(async () => {
    try {
      // Get subAdminId from state or localStorage
      const subAdminId =
        state?.subAdminId || localStorage.getItem("subAdminId");

      if (!subAdminId) {
        console.error("No subAdminId found in state or localStorage");
        alert("SubAdmin ID not found. Please log in again.");
        return;
      }

      console.log("Fetching complaints for subAdminId:", subAdminId);
      const res = await axios.get(
        `http://localhost:5000/subadmin/${subAdminId}/complaints`
      );
      console.log("Complaints response:", res.data);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [state?.subAdminId]);

  const fetchForwardedComplaints = useCallback(async () => {
    try {
      // Get subAdminId from state or localStorage
      const subAdminId =
        state?.subAdminId || localStorage.getItem("subAdminId");

      if (!subAdminId) {
        console.error("No subAdminId found in state or localStorage");
        alert("SubAdmin ID not found. Please log in again.");
        return;
      }

      console.log("Fetching forwarded complaints for subAdminId:", subAdminId);
      const res = await axios.get(
        `http://localhost:5000/subadmin/${subAdminId}/forwarded-complaints`
      );
      console.log("Forwarded complaints response:", res.data);
      setForwardedComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch forwarded complaints:", err);
      alert("Failed to load forwarded complaints");
    }
  }, [state?.subAdminId]);

  useEffect(() => {
    fetchComplaints();
    fetchForwardedComplaints();
  }, [fetchComplaints, fetchForwardedComplaints]);

  const handleResponse = (complaintId) => {
    setResponseModal({ isOpen: true, complaintId, response: "" });
  };

  const handleSubmitResponse = async () => {
    if (!responseModal.response.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/subadmin/complaint/${responseModal.complaintId}/respond`,
        { response: responseModal.response.trim() }
      );
      alert("Response sent successfully!");
      setResponseModal({
        isOpen: false,
        complaintId: null,
        response: "",
      });
      fetchComplaints();
    } catch (err) {
      console.error("Failed to send response:", err);
      alert("Failed to send response");
    }
  };

  const handleForwardToAdmin = async (complaintId) => {
    if (
      !window.confirm(
        "Are you sure you want to forward this complaint to admin?"
      )
    ) {
      return;
    }
    try {
      // Get subAdminId from state or localStorage
      const subAdminId =
        state?.subAdminId || localStorage.getItem("subAdminId");

      if (!subAdminId) {
        console.error("No subAdminId found for forwarding");
        alert("SubAdmin ID not found. Please log in again.");
        return;
      }

      console.log("Forwarding complaint with subAdminId:", subAdminId);

      await axios.post(
        `http://localhost:5000/subadmin/complaint/${complaintId}/forward`,
        { subAdminId: subAdminId } // Pass the SubAdmin ID for tracking
      );
      alert("Complaint forwarded to admin!");
      fetchComplaints();
    } catch (err) {
      console.error("Failed to forward complaint:", err);
      alert(
        "Failed to forward complaint: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Filter complaints based on search term and status
  const filteredComplaints = complaints.filter((complaint) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      complaint.studentName?.toLowerCase().includes(searchLower) ||
      complaint.studentEmail?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      complaint.complaintId?.toLowerCase().includes(searchLower)
    );
  });

  const filteredForwardedComplaints = forwardedComplaints.filter((complaint) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = complaint.role === "vendor" 
      ? complaint.userId?.vendorName || ""
      : `${complaint.userId?.firstName || ""} ${complaint.userId?.lastName || ""}`.trim();
    const studentEmail = complaint.role === "vendor"
      ? complaint.userId?.Email || ""
      : complaint.userId?.collegeEmail || "";
    
    return (
      studentName?.toLowerCase().includes(searchLower) ||
      studentEmail?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      complaint.complaintId?.toLowerCase().includes(searchLower)
    );
  });

  const pendingComplaints = filteredComplaints.filter(
    (c) => c.status !== "resolved"
  );
  const resolvedComplaints = filteredComplaints.filter(
    (c) => c.status === "resolved"
  );
  
  const currentComplaints =
    activeTab === "pending" ? pendingComplaints : 
    activeTab === "resolved" ? resolvedComplaints : 
    filteredForwardedComplaints;

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

  const complaintCardStyle = isLight
    ? {
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(0,0,0,0.05)",
      }
    : {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      };

  const buttonBase = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.1s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  };

  // Get subAdminId for status checker
  const currentSubAdminId =
    state?.subAdminId || localStorage.getItem("subAdminId");

  if (loading) {
    return (
      <SubAdminStatusChecker subAdminId={currentSubAdminId}>
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
          Loading complaints...
        </div>
      </SubAdminStatusChecker>
    );
  }

  return (
    <SubAdminStatusChecker subAdminId={currentSubAdminId}>
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
            maxWidth: "1280px",
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
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() =>
                  navigate("/subadmin", {
                    state: {
                      role: "SubAdmin",
                      subAdminId:
                        state?.subAdminId ||
                        localStorage.getItem("subAdminId"),
                    },
                  })
                }
                style={{
                  ...buttonBase,
                  background: isLight ? "#e2e8f0" : "#334155",
                  color: textMain,
                  padding: "8px 12px",
                }}
              >
                ← Back
              </button>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: textMain,
                }}
              >
                Complaints
              </h2>
            </div>

            {/* Controls: Search & Tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <input
                type="text"
                placeholder="Search by ID, name, email or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "280px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
                  background: isLight ? "#fff" : "#0f172a",
                  color: textMain,
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setActiveTab("pending")}
                  style={{
                    ...buttonBase,
                    background:
                      activeTab === "pending"
                        ? "#f59e0b"
                        : isLight
                        ? "#f1f5f9"
                        : "#1e293b",
                    color: activeTab === "pending" ? "white" : textSub,
                    border:
                      activeTab === "pending"
                        ? "none"
                        : `1px solid ${isLight ? "#e2e8f0" : "#334155"}`,
                  }}
                >
                  ⏳ Pending ({pendingComplaints.length})
                </button>
                <button
                  onClick={() => setActiveTab("resolved")}
                  style={{
                    ...buttonBase,
                    background:
                      activeTab === "resolved"
                        ? "#22c55e"
                        : isLight
                        ? "#f1f5f9"
                        : "#1e293b",
                    color: activeTab === "resolved" ? "white" : textSub,
                    border:
                      activeTab === "resolved"
                        ? "none"
                        : `1px solid ${isLight ? "#e2e8f0" : "#334155"}`,
                  }}
                >
                  ✅ Resolved ({resolvedComplaints.length})
                </button>
                <button
                  onClick={() => setActiveTab("forwarded")}
                  style={{
                    ...buttonBase,
                    background:
                      activeTab === "forwarded"
                        ? "#8b5cf6"
                        : isLight
                        ? "#f1f5f9"
                        : "#1e293b",
                    color: activeTab === "forwarded" ? "white" : textSub,
                    border:
                      activeTab === "forwarded"
                        ? "none"
                        : `1px solid ${isLight ? "#e2e8f0" : "#334155"}`,
                  }}
                >
                  📤 Forwarded to Admin ({forwardedComplaints.length})
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              height: 2,
              width: "100%",
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              marginBottom: 30,
              opacity: 0.6,
              borderRadius: 999,
            }}
          />

          {/* Complaints List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              minHeight: "300px",
            }}
          >
            <AnimatePresence mode="wait">
              {currentComplaints.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    background: isLight
                      ? "rgba(255,255,255,0.4)"
                      : "transparent",
                    borderRadius: "12px",
                    color: textSub,
                  }}
                >
                  {activeTab === "pending"
                    ? "No pending complaints found"
                    : activeTab === "resolved"
                    ? "No resolved complaints found"
                    : "No forwarded complaints found"}
                </motion.div>
              ) : (
                currentComplaints.map((complaint) => (
                  <motion.div
                    key={complaint._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    style={{
                      ...complaintCardStyle,
                      padding: "24px",
                      borderRadius: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              padding: "4px 12px",
                              background:
                                complaint.status === "resolved"
                                  ? "#22c55e"
                                  : complaint.status === "active"
                                  ? "#f59e0b"
                                  : activeTab === "forwarded"
                                  ? "#8b5cf6"
                                  : "#f59e0b",
                              color: "white",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            {activeTab === "forwarded" ? "Forwarded to Admin" : complaint.status}
                          </span>
                          <span
                            style={{
                              fontWeight: "700",
                              color: textMain,
                              fontSize: "15px",
                              fontFamily: "monospace",
                            }}
                          >
                            #{complaint.complaintId}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: textSub }}>
                          <div style={{ marginBottom: "4px" }}>
                            <strong style={{ color: textMain }}>From:</strong>{" "}
                            {complaint.role === "vendor"
                              ? `${
                                  complaint.userId?.vendorName ||
                                  "Unknown Vendor"
                                } (${complaint.userId?.Email || "No email"})`
                              : `${
                                  complaint.userId?.firstName || "Unknown"
                                } ${complaint.userId?.lastName || ""} (${
                                  complaint.userId?.collegeEmail || "No email"
                                })`}
                          </div>
                          <div>
                            <strong style={{ color: textMain }}>Date:</strong>{" "}
                            {new Date(complaint.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: isLight
                          ? "rgba(241, 245, 249, 0.8)"
                          : "rgba(15, 23, 42, 0.4)",
                        padding: "16px",
                        borderRadius: "12px",
                        marginBottom: "16px",
                        border: `1px solid ${
                          isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
                        }`,
                      }}
                    >
                      <p
                        style={{
                          color: textMain,
                          lineHeight: "1.6",
                          margin: 0,
                          fontSize: "14px",
                        }}
                      >
                        {complaint.description}
                      </p>
                    </div>

                    {complaint.response && (
                      <div
                        style={{
                          background: isLight
                            ? "rgba(236, 253, 245, 0.8)"
                            : "rgba(6, 78, 59, 0.3)",
                          padding: "16px",
                          borderRadius: "12px",
                          marginBottom: "16px",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <p
                          style={{
                            color: "#10b981",
                            fontWeight: "700",
                            marginBottom: "6px",
                            fontSize: "12px",
                            textTransform: "uppercase",
                          }}
                        >
                          Response from SubAdmin:
                        </p>
                        <p
                          style={{
                            color: isLight ? "#065f46" : "#a7f3d0",
                            lineHeight: "1.6",
                            margin: 0,
                            fontSize: "14px",
                          }}
                        >
                          {complaint.response}
                        </p>
                      </div>
                    )}

                    {complaint.screenshot && (
                      <div style={{ marginBottom: "16px" }}>
                        <img
                          src={complaint.screenshot}
                          alt="Complaint screenshot"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "300px",
                            borderRadius: "12px",
                            border: `1px solid ${
                              isLight ? "#e5e7eb" : "#334155"
                            }`,
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                    {complaint.status === "active" && activeTab !== "forwarded" && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleResponse(complaint._id)}
                          style={{
                            ...buttonBase,
                            background: "#10b981",
                            color: "white",
                          }}
                        >
                          Send Response
                        </button>
                        <button
                          onClick={() => handleForwardToAdmin(complaint._id)}
                          style={{
                            ...buttonBase,
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          Forward to Admin
                        </button>
                      </div>
                    )}

                    {activeTab === "forwarded" && (
                      <div style={{ 
                        padding: "12px 16px",
                        background: "rgba(139, 92, 246, 0.1)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                        color: "#7c3aed",
                        fontSize: "13px",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        📤 This complaint has been forwarded to Admin for review
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Response Modal */}
          <AnimatePresence>
            {responseModal.isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  style={{
                    backgroundColor: isLight ? "#fff" : "#1e293b",
                    padding: "24px",
                    borderRadius: "20px",
                    width: "90%",
                    maxWidth: "500px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    border: `1px solid ${
                      isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
                    }`,
                    color: textMain,
                  }}
                >
                  <h3 style={{ margin: "0 0 16px 0", color: textMain }}>
                    Send Response to Student
                  </h3>
                  <textarea
                    value={responseModal.response}
                    onChange={(e) =>
                      setResponseModal({
                        ...responseModal,
                        response: e.target.value,
                      })
                    }
                    placeholder="Enter your response..."
                    style={{
                      width: "100%",
                      height: "120px",
                      padding: "12px",
                      borderRadius: "12px",
                      border: `1px solid ${
                        isLight ? "#e2e8f0" : "#475569"
                      }`,
                      background: isLight ? "#f8fafc" : "#0f172a",
                      color: textMain,
                      fontSize: "14px",
                      resize: "vertical",
                      outline: "none",
                      marginBottom: "20px",
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() =>
                        setResponseModal({
                          isOpen: false,
                          complaintId: null,
                          response: "",
                        })
                      }
                      style={{
                        ...buttonBase,
                        background: isLight ? "#e2e8f0" : "#334155",
                        color: textMain,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitResponse}
                      style={{
                        ...buttonBase,
                        background: "#10b981",
                        color: "white",
                      }}
                    >
                      Send Response
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </SubAdminStatusChecker>
  );
}

export default SubAdminComplaints;
