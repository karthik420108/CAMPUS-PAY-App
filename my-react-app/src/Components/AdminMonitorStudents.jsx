import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";

function AdminMonitorStudents() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [theme, setTheme] = useState("light");
  const [lastUpdatedList, setLastUpdatedList] = useState(null);
  const [lastUpdatedDetails, setLastUpdatedDetails] = useState(null);
  const [showAllTxModal, setShowAllTxModal] = useState(false);
  const [showAllComplaintsModal, setShowAllComplaintsModal] = useState(false);

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }
    fetchStudents();
    const intervalId = setInterval(fetchStudents, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!showDetails || !selectedStudent?.student?._id) return;
    const studentId = selectedStudent.student._id;
    const intervalId = setInterval(() => {
      fetchStudentDetails(studentId);
    }, 15000);
    return () => clearInterval(intervalId);
  }, [showDetails, selectedStudent?.student?._id]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/monitor/students");
      setStudents(res.data);
      setLastUpdatedList(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await axios.get(`http://localhost:5000/admin/monitor/student/${studentId}`);
      setSelectedStudent(res.data);
      setShowDetails(true);
      setLastUpdatedDetails(new Date());
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedStudent(null);
    setShowAllTxModal(false);
    setShowAllComplaintsModal(false);
  };

  const toggleFreeze = async (e, studentId, currentStatus) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/user/${studentId}/freeze`, { isFrozen: !currentStatus });
      fetchStudents();
      if (showDetails && selectedStudent && selectedStudent.student._id === studentId) {
        fetchStudentDetails(studentId);
      }
    } catch (err) {
      alert("Failed to update student status");
    }
  };

  const toggleSuspend = async (e, studentId, currentStatus) => {
    e.stopPropagation();
    try {
      const reason = currentStatus ? prompt("Enter reason for unsuspending:") : prompt("Enter reason for suspension:");
      if (reason === null) return;

      await axios.put(`http://localhost:5000/admin/monitor/student/${studentId}/suspend`, {
        isSuspended: !currentStatus,
        reason: reason,
      });
      fetchStudents();
      if (showDetails && selectedStudent && selectedStudent.student._id === studentId) {
        fetchStudentDetails(studentId);
      }
    } catch (err) {
      alert("Failed to update student suspend status");
    }
  };

  const handleKycApproval = async (status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/admin/monitor/student/${selectedStudent.student._id}/kyc`, {
        status: status,
        rejectionReason: status === "rejected" ? rejectionReason : "",
      });
      await fetchStudentDetails(selectedStudent.student._id);
      setShowKycModal(false);
      setRejectionReason("");
      alert(`Student KYC ${status} successfully`);
    } catch (err) {
      alert("Failed to update KYC status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": case "SUCCESS": case "resolved": return "#22c55e";
      case "pending": case "PENDING": return "#f59e0b";
      case "rejected": case "FAILED": return "#ef4444";
      default: return isLight ? "#64748b" : "#94a3b8";
    }
  };

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const pageStyle = isLight ? {
    background: "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%), radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
    backgroundColor: "#f3f4f6",
  } : {
    backgroundColor: "#020617",
    backgroundImage: "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%), radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%), linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.9) 1px, transparent 1px)",
    backgroundSize: "cover, cover, cover, cover, 80px 80px, 80px 80px",
    backgroundPosition: "center, center, center, center, 0 0, 0 0",
  };

  const cardStyle = isLight ? {
    background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
    border: "1px solid rgba(148,163,184,0.35)",
    boxShadow: "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
  } : {
    background: "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
    border: "1px solid rgba(148,163,184,0.45)",
    boxShadow: "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
  };

  const sectionBoxStyle = {
    padding: "20px",
    borderRadius: "16px",
    background: isLight ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)",
    border: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
    marginBottom: "24px" // spacing between stacked sections
  };

  const tableHeaderStyle = {
    color: textSub, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", padding: "16px", textAlign: "left", borderBottom: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)",
  };

  const tableCellStyle = {
    color: textMain, fontSize: "13px", padding: "16px", borderBottom: isLight ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.05)",
  };

  const buttonBase = {
    padding: "6px 12px", borderRadius: "8px", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "transform 0.1s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
  };

  if (loading) return <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: textMain }}>Loading...</div>;

  return (
    <>
      <Header title="Monitor Students" userRole="admin" userName="Admin" />
      <motion.div style={{ ...pageStyle, minHeight: "100vh", padding: "40px 16px", display: "flex", justifyContent: "center", alignItems: "flex-start", position: "relative", overflow: "hidden" }}>
        
        <motion.div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: isLight ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)" : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)", filter: "blur(60px)", opacity: 0.4, top: -50, left: -50 }} animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }} />

        <motion.div initial={{ opacity: 0, y: 32, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: easingSoft }} style={{ width: "100%", maxWidth: "1400px", borderRadius: 28, padding: "30px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", color: textMain, position: "relative", marginTop: "20px", ...cardStyle }}>
          
          <div style={{ position: "absolute", top: 20, right: 20, display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: 999, border: `1px solid ${isLight ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.4)"}`, background: isLight ? "#f9fafb" : "rgba(15,23,42,0.8)", zIndex: 10 }}>
            <span style={{ fontSize: 11, color: textSub, paddingLeft: 4 }}>Mode</span>
            <button onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} style={{ border: "none", borderRadius: 999, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600, background: isLight ? "linear-gradient(120deg,#020617,#0f172a)" : "linear-gradient(120deg,#e5f2ff,#dbeafe)", color: isLight ? "#e5e7eb" : "#0f172a" }}>{isLight ? "Dark" : "Light"}</button>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: textSub, marginBottom: 6 }}>Admin Dashboard</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: textMain, margin: 0 }}>Student Monitor</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div style={{ fontSize: 12, color: textSub }}>
                {!showDetails
                  ? (lastUpdatedList ? `Last updated: ${lastUpdatedList.toLocaleTimeString()}` : "")
                  : (lastUpdatedDetails ? `Last updated: ${lastUpdatedDetails.toLocaleTimeString()}` : "")}
              </div>
              <button
                onClick={() => {
                  if (!showDetails) {
                    fetchStudents();
                  } else if (selectedStudent?.student?._id) {
                    fetchStudentDetails(selectedStudent.student._id);
                  }
                }}
                style={{ ...buttonBase, background: "#10b981", color: "white" }}
              >
                Refresh
              </button>
            </div>
            <div style={{ height: 2, width: "100%", background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)", marginTop: 15, opacity: 0.8, borderRadius: 999 }} />
          </div>

          <AnimatePresence mode="wait">
            {!showDetails ? (
              <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {students.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: textSub }}>No students found</div> : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }} cellPadding={0} cellSpacing={0}>
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>Student</th>
                          <th style={tableHeaderStyle}>Contact</th>
                          <th style={tableHeaderStyle}>Spending</th>
                          <th style={tableHeaderStyle}>Status</th>
                          <th style={tableHeaderStyle}>Activity</th>
                          <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student._id}>
                            <td style={tableCellStyle}>
                              <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                              <div style={{ fontSize: "11px", color: textSub }}>Joined: {new Date(student.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td style={tableCellStyle}>{student.collegeEmail}</td>
                            <td style={tableCellStyle}>₹{student.totalSpending?.toFixed(2) || "0.00"}</td>
                            <td style={tableCellStyle}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: getStatusColor(student.kyc?.status) }}>KYC: {student.kyc?.status?.toUpperCase() || "PENDING"}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {student.isFrozen && <span style={{ fontSize: "10px", background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>FROZEN</span>}
                                  {student.isSuspended && <span style={{ fontSize: "10px", background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>SUSPENDED</span>}
                                  {!student.isFrozen && !student.isSuspended && <span style={{ fontSize: "10px", background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>ACTIVE</span>}
                                </div>
                              </div>
                            </td>
                            <td style={tableCellStyle}>{student.totalTransactions || 0} Txns</td>
                            <td style={tableCellStyle}>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button onClick={(e) => { e.stopPropagation(); fetchStudentDetails(student._id); }} style={{ ...buttonBase, background: "#3b82f6", color: "white" }}>View</button>
                                <button onClick={(e) => toggleFreeze(e, student._id, student.isFrozen)} style={{ ...buttonBase, background: student.isFrozen ? "#22c55e" : "#ef4444", color: "white" }}>{student.isFrozen ? "Unfreeze" : "Freeze"}</button>
                                <button onClick={(e) => toggleSuspend(e, student._id, student.isSuspended)} style={{ ...buttonBase, background: student.isSuspended ? "#22c55e" : "#f59e0b", color: "white" }}>{student.isSuspended ? "Restore" : "Suspend"}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <button onClick={handleBackToList} style={{ marginBottom: "20px", background: "transparent", border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`, color: textMain, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}><span>←</span> Back to List</button>

                {selectedStudent && (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      
                      {/* Basic Info */}
                      <div style={sectionBoxStyle}>
                        <h3 style={{ marginTop: 0, color: textMain }}>{selectedStudent.student.firstName} {selectedStudent.student.lastName}</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <div><div style={{ fontSize: 11, color: textSub, textTransform: "uppercase" }}>Email</div><div style={{ fontWeight: 500 }}>{selectedStudent.student.collegeEmail}</div></div>
                          <div><div style={{ fontSize: 11, color: textSub, textTransform: "uppercase" }}>Parent Email</div><div style={{ fontWeight: 500 }}>{selectedStudent.student.parentEmail || "N/A"}</div></div>
                          <div><div style={{ fontSize: 11, color: textSub, textTransform: "uppercase" }}>Account Status</div><div style={{ fontWeight: 600, color: selectedStudent.student.isFrozen ? "#ef4444" : "#22c55e" }}>{selectedStudent.student.isFrozen ? "FROZEN" : "ACTIVE"}{selectedStudent.student.isSuspended && <span style={{ color: "#ef4444" }}> • SUSPENDED</span>}</div></div>
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div style={sectionBoxStyle}>
                        <h4 style={{ marginTop: 0, marginBottom: 15, color: textMain }}>Recent Transactions (Last 5)</h4>
                        {selectedStudent.transactions.length === 0 ? <p style={{ color: textSub, fontSize: 13 }}>No transactions found.</p> : (
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr><th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Vendor</th><th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Amount</th><th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Status</th><th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Date</th></tr>
                            </thead>
                            <tbody>
                              {[...selectedStudent.transactions]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 5)
                                .map((tx, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}` }}>
                                  <td style={{ ...tableCellStyle, padding: "10px 0" }}>{tx.vendorId?.vendorName || tx.vendorId?.vendorid || tx.vendorid || "-"}</td>
                                  <td style={{ ...tableCellStyle, padding: "10px 0" }}>₹{tx.amount}</td>
                                  <td style={{ ...tableCellStyle, padding: "10px 0", color: getStatusColor(tx.status) }}>{tx.status}</td>
                                  <td style={{ ...tableCellStyle, padding: "10px 0", color: textSub }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {selectedStudent.transactions.length > 5 && (
                          <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                            <button
                              onClick={() => setShowAllTxModal(true)}
                              style={{ ...buttonBase, background: "#3b82f6", color: "white" }}
                            >
                              View More
                            </button>
                          </div>
                        )}
                      </div>

                      {/* NEW: Recent Complaints (Last 5) */}
                      <div style={sectionBoxStyle}>
                        <h4 style={{ marginTop: 0, marginBottom: 15, color: textMain }}>Recent Complaints (Last 5)</h4>
                        {selectedStudent.complaints && selectedStudent.complaints.length > 0 ? (
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>ID</th>
                                <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Description</th>
                                <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Status</th>
                                <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...selectedStudent.complaints]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 5)
                                .map((complaint, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}` }}>
                                  <td style={{ ...tableCellStyle, padding: "10px 0", color: textSub }}>#{complaint.complaintId || complaint._id?.substring(0,6)}</td>
                                  <td style={{ ...tableCellStyle, padding: "10px 0" }}>
                                    {complaint.description && complaint.description.length > 50 
                                      ? complaint.description.substring(0, 50) + "..." 
                                      : complaint.description || "No description"}
                                  </td>
                                  <td style={{ ...tableCellStyle, padding: "10px 0", color: getStatusColor(complaint.status) }}>
                                    {complaint.status?.toUpperCase()}
                                  </td>
                                  <td style={{ ...tableCellStyle, padding: "10px 0", color: textSub }}>
                                    {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ color: textSub, fontSize: 13 }}>No complaints found.</p>
                        )}

                        {selectedStudent.complaints && selectedStudent.complaints.length > 5 && (
                          <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                            <button
                              onClick={() => setShowAllComplaintsModal(true)}
                              style={{ ...buttonBase, background: "#3b82f6", color: "white" }}
                            >
                              View More
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      <div style={sectionBoxStyle}>
                        <h4 style={{ marginTop: 0, color: textMain }}>Overview</h4>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: textSub, fontSize: 13 }}>Total Spending</span><span style={{ fontWeight: 700, color: "#3b82f6" }}>₹{selectedStudent.stats.totalSpending?.toFixed(2) || 0}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: textSub, fontSize: 13 }}>Transactions</span><span style={{ fontWeight: 600 }}>{selectedStudent.stats.totalTransactions}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: textSub, fontSize: 13 }}>Complaints</span><span style={{ fontWeight: 600 }}>{selectedStudent.stats.totalComplaints}</span></div>
                      </div>

                      <div style={sectionBoxStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h4 style={{ margin: 0, color: textMain }}>KYC Document</h4><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: getStatusColor(selectedStudent.student.kyc?.status), color: "#fff" }}>{selectedStudent.student.kyc?.status?.toUpperCase() || "PENDING"}</span></div>
                        {selectedStudent.student.kyc?.imageUrl ? (
                          <div>
                            <img src={selectedStudent.student.kyc.imageUrl} alt="KYC" style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, cursor: "pointer" }} onClick={() => window.open(selectedStudent.student.kyc.imageUrl, "_blank")} />
                            <div style={{ fontSize: 11, color: textSub, textAlign: "center", marginTop: 4 }}>Click to enlarge</div>
                            {selectedStudent.student.kyc?.status === "pending" && (
                              <div style={{ marginTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
                                <button onClick={() => handleKycApproval("verified")} style={{ ...buttonBase, background: "#22c55e", color: "white", width: "100%" }}>Approve KYC</button>
                                <button onClick={() => setShowKycModal(true)} style={{ ...buttonBase, background: "transparent", border: "1px solid #ef4444", color: "#ef4444", width: "100%" }}>Reject KYC</button>
                              </div>
                            )}
                            {selectedStudent.student.kyc?.rejectionReason && <div style={{ marginTop: 15, padding: 10, background: "rgba(239,68,68,0.1)", borderRadius: 8, fontSize: 12, color: "#ef4444" }}><strong>Reason:</strong> {selectedStudent.student.kyc.rejectionReason}</div>}
                          </div>
                        ) : (
                          <div style={{ padding: "30px", textAlign: "center", border: "1px dashed #94a3b8", borderRadius: 8, color: textSub, fontSize: 12 }}>No Document Uploaded</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showKycModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: "90%", maxWidth: "400px", padding: "24px", borderRadius: "16px", background: isLight ? "#fff" : "#1e293b", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", color: textMain }}>
              <h3 style={{ marginTop: 0 }}>Reject KYC</h3>
              <p style={{ fontSize: 13, color: textSub }}>Please provide a reason for rejection.</p>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g., Image is blurry, ID not clear..." style={{ width: "100%", height: "80px", padding: "10px", borderRadius: "8px", border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`, background: isLight ? "#f8fafc" : "#0f172a", color: textMain, resize: "none", marginTop: "10px", marginBottom: "20px" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => { setShowKycModal(false); setRejectionReason(""); }} style={{ ...buttonBase, background: isLight ? "#e2e8f0" : "#334155", color: textMain }}>Cancel</button>
                <button onClick={() => handleKycApproval("rejected")} style={{ ...buttonBase, background: "#ef4444", color: "white" }}>Confirm Rejection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllTxModal && selectedStudent && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1100,
              padding: "16px",
            }}
            onClick={() => setShowAllTxModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                width: "100%",
                maxWidth: "900px",
                maxHeight: "80vh",
                overflow: "hidden",
                borderRadius: "16px",
                background: isLight ? "#fff" : "#0f172a",
                border: `1px solid ${isLight ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.45)"}`,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25)",
                color: textMain,
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: "16px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
              }}>
                <div style={{ fontWeight: 700 }}>
                  All Transactions ({selectedStudent.transactions.length})
                </div>
                <button
                  onClick={() => setShowAllTxModal(false)}
                  style={{ ...buttonBase, padding: "6px 10px", background: isLight ? "#e2e8f0" : "#334155", color: textMain }}
                >
                  Close
                </button>
              </div>

              <div style={{
                padding: "16px 18px",
                overflowY: "auto",
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Vendor</th>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Amount</th>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Status</th>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedStudent.transactions]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((tx, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}` }}>
                          <td style={{ ...tableCellStyle, padding: "10px 0" }}>{tx.vendorId?.vendorName || tx.vendorId?.vendorid || tx.vendorid || "-"}</td>
                          <td style={{ ...tableCellStyle, padding: "10px 0" }}>₹{tx.amount}</td>
                          <td style={{ ...tableCellStyle, padding: "10px 0", color: getStatusColor(tx.status) }}>{tx.status}</td>
                          <td style={{ ...tableCellStyle, padding: "10px 0", color: textSub }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllComplaintsModal && selectedStudent && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1200,
              padding: "16px",
            }}
            onClick={() => setShowAllComplaintsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                width: "100%",
                maxWidth: "900px",
                maxHeight: "80vh",
                overflow: "hidden",
                borderRadius: "16px",
                background: isLight ? "#fff" : "#0f172a",
                border: `1px solid ${isLight ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.45)"}`,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.25)",
                color: textMain,
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  All Complaints ({selectedStudent.complaints?.length || 0})
                </div>
                <button
                  onClick={() => setShowAllComplaintsModal(false)}
                  style={{ ...buttonBase, padding: "6px 10px", background: isLight ? "#e2e8f0" : "#334155", color: textMain }}
                >
                  Close
                </button>
              </div>

              <div
                style={{
                  padding: "16px 18px",
                  overflowY: "auto",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>ID</th>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Description</th>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Status</th>
                      <th style={{ ...tableHeaderStyle, padding: "8px 0" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedStudent.complaints]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((complaint, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}` }}>
                          <td style={{ ...tableCellStyle, padding: "10px 0", color: textSub }}>#{complaint.complaintId || complaint._id?.substring(0,6)}</td>
                          <td style={{ ...tableCellStyle, padding: "10px 0" }}>{complaint.description || "No description"}</td>
                          <td style={{ ...tableCellStyle, padding: "10px 0", color: getStatusColor(complaint.status) }}>{complaint.status?.toUpperCase()}</td>
                          <td style={{ ...tableCellStyle, padding: "10px 0", color: textSub }}>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminMonitorStudents;
