import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";

function AdminVendorKYC() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();
  const navigate = useNavigate();

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
      alert(`Vendor KYC ${status} successfully!`);
    } catch (err) {
      console.error("Error updating KYC:", err);
      alert("Failed to update KYC status");
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

  if (loading) {
    return (
      <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: textSub, fontWeight: 600 }}>Loading vendors...</span>
      </div>
    );
  }

  // Separate vendors into pending and completed
  const pendingVendors = vendors.filter(vendor => !vendor.kyc?.status || vendor.kyc?.status === "pending");
  const completedVendors = vendors.filter(vendor => ["verified", "rejected", "success"].includes(vendor.kyc?.status));

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
                   <img 
                       src={vendor.kyc.imageUrl} 
                       alt="KYC Document" 
                       style={{ height: "120px", borderRadius: "8px", border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, cursor: "zoom-in" }}
                       onClick={() => window.open(vendor.kyc.imageUrl, '_blank')}
                   />
               </div>
           ) : (
               <div style={{ padding: "12px", background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.05)", borderRadius: "8px", color: textSub, fontSize: "13px", fontStyle: "italic" }}>
                   No KYC document uploaded.
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
            
            {/* Theme Toggle - Capsule Style */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 999, border: "1px solid rgba(148,163,184,0.6)", background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)", fontSize: 11, backdropFilter: "blur(8px)" }}>
                <span style={{ color: "#6b7280", paddingLeft: 4 }}>Mode</span>
                <button type="button" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} style={{ border: "none", borderRadius: 999, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: isLight ? "linear-gradient(120deg,#020617,#0f172a)" : "linear-gradient(120deg,#e5f2ff,#dbeafe)", color: isLight ? "#e5e7eb" : "#0f172a" }}>
                    {isLight ? "Dark" : "Light"}
                </button>
            </div>
        </div>

        <button 
            onClick={() => navigate(-1)} 
            style={{ ...buttonStyleBase, background: "transparent", color: textSub, border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}`, marginBottom: "24px" }}
        >
            ← Back to Dashboard
        </button>

        <AnimatePresence>
            {vendors.length === 0 ? (
                <div style={{ ...cardStyle, padding: "40px", borderRadius: "16px", textAlign: "center", color: textSub }}>No vendors found.</div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                    {/* Pending KYC Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            ⏳ Pending KYC ({pendingVendors.length})
                        </h3>
                        {pendingVendors.length === 0 ? (
                            <p style={{ color: textSub, fontStyle: "italic", fontSize: "14px" }}>No pending KYC applications</p>
                        ) : (
                            <div>
                                {pendingVendors.map(vendor => <VendorCard key={vendor._id} vendor={vendor} />)}
                            </div>
                        )}
                    </motion.div>

                    {/* Completed KYC Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            ✅ Completed KYC ({completedVendors.length})
                        </h3>
                        {completedVendors.length === 0 ? (
                            <p style={{ color: textSub, fontStyle: "italic", fontSize: "14px" }}>No completed KYC applications</p>
                        ) : (
                            <div>
                                {completedVendors.map(vendor => <VendorCard key={vendor._id} vendor={vendor} />)}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminVendorKYC;
