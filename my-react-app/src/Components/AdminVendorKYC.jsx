import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";
import { useAlert } from "../context/AlertContext";

function AdminVendorKYC() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Theme state
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

    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin/vendors");
        setVendors(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setLoading(false);
      }
    };

    fetchVendors();
  }, [state, navigate]);

  const handleKYCUpdate = async (vendorId, status) => {
    try {
      await axios.post(`http://localhost:5000/admin/vendor/${vendorId}/kyc`, { status });
      const response = await axios.get("http://localhost:5000/admin/vendors");
      setVendors(response.data);
      showAlert({
        type: "success",
        title: "KYC Updated",
        message: `Vendor KYC ${status} successfully!`
      });
    } catch (err) {
      console.error("Error updating KYC:", err);
      showAlert({
        type: "error",
        title: "KYC Update Failed",
        message: "Failed to update KYC status"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "success": return "#10b981"; // Green
      case "rejected": return "#ef4444"; // Red
      case "pending":
      default: return "#f59e0b"; // Orange
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVendors = vendors.filter(vendor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vendor.vendorName?.toLowerCase().includes(searchLower) ||
      vendor.Email?.toLowerCase().includes(searchLower) ||
      vendor.vendorId?.toLowerCase().includes(searchLower)
    );
  });

  // Apply status filter
  const statusFilteredVendors = statusFilter === "pending" 
    ? filteredVendors.filter(vendor => !vendor.kyc?.status || vendor.kyc?.status === "pending")
    : filteredVendors.filter(vendor => ["verified", "rejected", "success"].includes(vendor.kyc?.status));

  // Separate filtered vendors into pending and completed
  const pendingVendors = statusFilter === "pending" ? statusFilteredVendors : [];
  const completedVendors = statusFilter === "completed" ? statusFilteredVendors : [];

  const handleViewKyc = (kycUrl, vendor) => {
    navigate("/view-kyc", {
      state: {
        kycUrl: kycUrl,
        vendorName: vendor.vendorName
      }
    });
  };

  const VendorCard = ({ vendor }) => (
    <div style={{ ...cardStyle, padding: "24px", borderRadius: "16px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
       {/* Status Line */}
       <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: getStatusColor(vendor.kyc?.status) }}></div>
       
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "18px", color: textMain }}>{vendor.vendorName}</h4>
                <span style={{ 
                    fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", 
                    background: getStatusColor(vendor.kyc?.status), color: "white", textTransform: "uppercase" 
                }}>
                    {vendor.kyc?.status || "pending"}
                </span>
           </div>
           
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
               <div>
                   <label style={{ fontSize: "11px", color: textSub, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vendor ID</label>
                   <div style={{ color: textMain, fontSize: "13px", fontWeight: "500" }}>{vendor.vendorId}</div>
               </div>
               <div>
                   <label style={{ fontSize: "11px", color: textSub, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
                   <div style={{ color: textMain, fontSize: "13px", fontWeight: "500" }}>{vendor.Email}</div>
               </div>
               <div>
                   <label style={{ fontSize: "11px", color: textSub, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registered</label>
                   <div style={{ color: textMain, fontSize: "13px", fontWeight: "500" }}>{new Date(vendor.createdAt).toLocaleDateString()}</div>
               </div>
               <div>
                   <label style={{ fontSize: "11px", color: textSub, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>KYC Submitted</label>
                   <div style={{ color: textMain, fontSize: "13px", fontWeight: "500" }}>
                       {vendor.kyc?.submittedAt ? new Date(vendor.kyc.submittedAt).toLocaleDateString() : "Not submitted"}
                   </div>
               </div>
           </div>
           
           {vendor.kyc?.imageUrl ? (
               <div>
                   <div style={{ fontSize: "11px", color: textSub, marginBottom: "6px", fontWeight: "700" }}>KYC DOCUMENT</div>
                   <div style={{ 
                       padding: "16px", 
                       background: isLight ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.2)", 
                       borderRadius: "8px", 
                       border: `1px solid ${isLight ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.4)"}`,
                       textAlign: "center",
                       cursor: "pointer",
                       transition: "all 0.2s ease"
                   }}
                       onClick={() => handleViewKyc(vendor.kyc.imageUrl, vendor)}
                       onMouseEnter={(e) => {
                           e.target.style.background = isLight ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.3)";
                       }}
                       onMouseLeave={(e) => {
                           e.target.style.background = isLight ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.2)";
                       }}
                   >
                       <div style={{ fontSize: "24px", marginBottom: "8px" }}>📄</div>
                       <div style={{ fontSize: "14px", fontWeight: 600, color: isLight ? "#1e40af" : "#60a5fa" }}>
                           KYC Document Available
                       </div>
                       <div style={{ fontSize: "12px", color: textSub, marginTop: "4px" }}>
                           Click to view full document
                       </div>
                   </div>
               </div>
           ) : (
               <div style={{ 
                   padding: "16px", 
                   background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)", 
                   borderRadius: "8px", 
                   color: textSub, 
                   fontSize: "13px", 
                   fontStyle: "italic",
                   textAlign: "center",
                   border: `1px dashed ${isLight ? "#e2e8f0" : "#334155"}`
               }}>
                   📄 No KYC document uploaded.
               </div>
           )}
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "140px" }}>
             {vendor.kyc?.status === "pending" && (
                <>
                   <button onClick={() => handleKYCUpdate(vendor._id, "verified")} style={{ ...buttonStyleBase, background: "#10b981", color: "white", width: "100%" }}>
                       ✅ Approve
                   </button>
                   <button onClick={() => handleKYCUpdate(vendor._id, "rejected")} style={{ ...buttonStyleBase, background: "#ef4444", color: "white", width: "100%" }}>
                       ❌ Reject
                   </button>
                </>
             )}
             
             {vendor.kyc?.status === "verified" && (
                <button onClick={() => handleKYCUpdate(vendor._id, "rejected")} style={{ ...buttonStyleBase, background: "#ef4444", color: "white", width: "100%" }}>
                    ❌ Revoke
                </button>
             )}
             
             {vendor.kyc?.status === "rejected" && (
                <button onClick={() => handleKYCUpdate(vendor._id, "verified")} style={{ ...buttonStyleBase, background: "#10b981", color: "white", width: "100%" }}>
                    ✅ Re-Approve
                </button>
             )}
        </div>
       </div>
    </div>
  );

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
        <Header title="Vendor KYC" userRole="admin" userName="Admin" />
      </div>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: "20px" }}>
            <div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: textMain, margin: 0 }}>Vendor KYC</h2>
                <p style={{ color: textSub, marginTop: "4px" }}>Verify and manage vendor identity documents</p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="🔍 Search vendors by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
                        background: isLight ? "#fff" : "#0f172a",
                        color: textMain,
                        outline: "none",
                        fontSize: "14px",
                        width: "300px",
                        boxShadow: isLight ? "0 2px 4px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.3)",
                        transition: "all 0.2s ease"
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = isLight ? "#3b82f6" : "#60a5fa";
                        e.target.style.boxShadow = isLight ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "0 0 0 3px rgba(96, 165, 250, 0.1)";
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = isLight ? "#cbd5e1" : "#475569";
                        e.target.style.boxShadow = isLight ? "0 2px 4px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.3)";
                    }}
                />
                
                {/* Status Filter Navigation */}
                <div style={{ display: "flex", background: isLight ? "#f8fafc" : "#1e293b", borderRadius: "12px", padding: "4px" }}>
                    <button
                        onClick={() => setStatusFilter("all")}
                        style={{
                            padding: "8px 16px",
                            background: statusFilter === "all" 
                                ? (isLight ? "#3b82f6" : "#2563eb") 
                                : "transparent",
                            color: statusFilter === "all" ? "white" : textMain,
                            border: "none",
                            borderRadius: "8px 0 0 8px 0",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 600,
                            transition: "all 0.2s ease"
                        }}
                    >
                        All ({vendors.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter("pending")}
                        style={{
                            padding: "8px 16px",
                            background: statusFilter === "pending" 
                                ? (isLight ? "#f59e0b" : "#d97706") 
                                : "transparent",
                            color: statusFilter === "pending" ? "white" : textMain,
                            border: "none",
                            borderRadius: "0 8px 8px 0",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 600,
                            transition: "all 0.2s ease"
                        }}
                    >
                        ⏳ Pending ({vendors.filter(v => !v.kyc?.status || v.kyc?.status === "pending").length})
                    </button>
                    <button
                        onClick={() => setStatusFilter("completed")}
                        style={{
                            padding: "8px 16px",
                            background: statusFilter === "completed" 
                                ? (isLight ? "#10b981" : "#059669") 
                                : "transparent",
                            color: statusFilter === "completed" ? "white" : textMain,
                            border: "none",
                            borderRadius: "0 8px 8px 0",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 600,
                            transition: "all 0.2s ease"
                        }}
                    >
                        ✅ Completed ({vendors.filter(v => ["verified", "rejected", "success"].includes(v.kyc?.status)).length})
                    </button>
                </div>
                
                {/* Theme Toggle - Capsule Style */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 999, border: "1px solid rgba(148,163,184,0.6)", background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)", fontSize: 11, backdropFilter: "blur(8px)" }}>
                    <span style={{ color: "#6b7280", paddingLeft: 4 }}>Mode</span>
                    <button type="button" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} style={{ border: "none", borderRadius: 999, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: isLight ? "linear-gradient(120deg,#020617,#0f172a)" : "linear-gradient(120deg,#e5f2ff,#dbeafe)", color: isLight ? "#e5e7eb" : "#0f172a" }}>
                        {isLight ? "Dark" : "Light"}
                    </button>
                </div>
            </div>
        </div>

        {/* Status Filtered Content */}
        <AnimatePresence>
            {statusFilteredVendors.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    ...cardStyle, 
                    padding: "60px", 
                    borderRadius: "20px", 
                    textAlign: "center", 
                    color: textSub,
                    margin: "40px auto",
                    maxWidth: "600px"
                  }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                        {statusFilter === "pending" ? "⏳" : statusFilter === "completed" ? "✅" : "📋"}
                    </div>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: 700, color: textMain }}>
                        No {statusFilter === "pending" ? "Pending" : statusFilter === "completed" ? "Completed" : ""} KYC Applications
                    </h3>
                    <p style={{ margin: 0, fontSize: "16px", lineHeight: "1.5" }}>
                        {statusFilter === "pending" 
                            ? "All vendors have completed the KYC verification process" 
                            : statusFilter === "completed" 
                            ? "No vendors have completed the KYC verification process yet" 
                            : "No vendors found"
                        }
                    </p>
                </motion.div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {statusFilteredVendors.map(vendor => <VendorCard key={vendor._id} vendor={vendor} />)}
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminVendorKYC;
