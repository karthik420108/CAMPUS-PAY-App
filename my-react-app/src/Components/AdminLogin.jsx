import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import Header from "./Header.jsx";

function AdminLogin() {
  const [ib, setIb] = useState(0);
  const [ur, setUr] = useState(0);
  const [vr, setVr] = useState(0);
  const [sr, setSr] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState("light"); 
  const isLight = theme === "light";

  const fetchDashboardData = async () => {
    try {
      // console.log("Fetching dashboard data...");
      const response = await axios.get("http://localhost:5000/admin/dashboard");
      setIb(response.data.instituteFunds || 0);
      setUr(response.data.userCount || 0);
      setVr(response.data.vendorCount || 0);
      setSr(response.data.subadminCount || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setIb(50000);
      setUr(156);
      setVr(24);
      setSr(5);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsCards = [
    { label: "Institute Funds", value: `₹${ib.toLocaleString()}`, icon: "💰", color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
    { label: "Users Registered", value: ur, icon: "👤", color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
    { label: "Vendors Registered", value: vr, icon: "🏪", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" },
    { label: "Subadmins Assigned", value: sr || 0, icon: "👨‍💼", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  ];

  const easingSoft = [0.16, 1, 0.3, 1];

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

  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.90), rgba(239,246,255,0.95))",
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

  if (loading) {
    return (
      <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: "24px", fontWeight: "600", color: textSub }}
        >
          Loading Admin Dashboard...
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
       {/* Background Orbs */}
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
            zIndex: 0,
            pointerEvents: "none"
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
              : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
            filter: "blur(50px)",
            opacity: 0.4,
            bottom: -50,
            right: -50,
            zIndex: 0,
            pointerEvents: "none"
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

      {/* Theme Toggle - zIndex 50 to stay clickable */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 6px",
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.6)",
          background: isLight ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.8)",
          backdropFilter: "blur(8px)",
          fontSize: 12,
          zIndex: 50,
        }}
      >
        <span style={{ color: textSub, paddingLeft: 4 }}>Mode</span>
        <button
          type="button"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "4px 12px",
            cursor: "pointer",
            fontSize: 12,
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

      {/* 
         FIX: Header Container zIndex raised to 100.
         This ensures the hamburger menu (which lives inside Header) 
         will always float ON TOP of the cards below.
      */}
      <div style={{ position: "relative", zIndex: 100 }}>
        <Header 
            title="Admin Dashboard" 
            userRole="admin" 
            userName="Admin" 
        />
      </div>

      {/* 
         FIX: Main Content zIndex lowered to 1.
         This ensures cards stay BEHIND the header's dropdowns.
      */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Title */}
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 32 }}
        >
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: textMain, letterSpacing: "-0.02em" }}>
                Overview
            </h1>
            <p style={{ color: textSub, fontSize: "14px" }}>Welcome back, Administrator.</p>
        </motion.div>

        {/* Stats Cards */}
        <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
            gap: "24px", 
            marginBottom: "40px" 
        }}>
          {statsCards.map((stat, index) => (
            <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: easingSoft }}
                whileHover={{ y: -5, boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.1)" : "0 20px 40px rgba(0,0,0,0.4)" }}
                style={{
                    ...cardStyle,
                    borderRadius: "20px",
                    overflow: "hidden",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: textSub, marginBottom: "8px" }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "700", color: textMain, letterSpacing: "-0.03em" }}>
                            {stat.value}
                        </div>
                    </div>
                    <div style={{ 
                        padding: "12px", 
                        borderRadius: "14px", 
                        background: stat.gradient,
                        color: "white", 
                        fontSize: "24px",
                        boxShadow: `0 8px 16px -4px ${stat.color}80`
                    }}>
                        {stat.icon}
                    </div>
                </div>
                {/* Decorative Line */}
                <div style={{ height: "4px", width: "100%", borderRadius: "2px", background: isLight ? "#f1f5f9" : "#1e293b", overflow: "hidden" }}>
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5 + (index * 0.1), duration: 1 }}
                        style={{ height: "100%", background: stat.gradient, borderRadius: "2px" }}
                     />
                </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: easingSoft }}
            style={{
                ...cardStyle,
                borderRadius: "24px",
                padding: "32px"
            }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "24px" }}>
             <h3 style={{ fontSize: "20px", fontWeight: "700", color: textMain }}>Quick Actions</h3>
             <span style={{ fontSize: "12px", color: textSub }}>Manage funds, users and complaints</span>
          </div>
          
          <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "20px" 
          }}>
            {[
                { path: "/add-funds", icon: "💰", label: "Add Institute Funds", color: "from-green-500 to-emerald-600" },
                { path: "/rrequests", icon: "💸", label: "Redeem Requests", color: "from-blue-500 to-indigo-600" },
                { path: "/add-notifications", icon: "📢", label: "Add Notification", color: "from-orange-500 to-red-600" },
                { path: "/admin-complaints", icon: "📝", label: "View Complaints", color: "from-purple-500 to-fuchsia-600" },
                { path: "/admin-monitor-vendors", icon: "🏪", label: "Monitor Vendors", color: "from-cyan-500 to-blue-600" },
                { path: "/admin-monitor-students", icon: "👨‍🎓", label: "Monitor Students", color: "from-teal-500 to-green-600" }
            ].map((action, idx) => (
                <motion.button
                    key={idx}
                    onClick={() => navigate(action.path, { state: { role: "admin" } })}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px 16px",
                        border: isLight ? "1px solid #e2e8f0" : "1px solid #334155",
                        borderRadius: "16px",
                        cursor: "pointer",
                        background: isLight ? "white" : "rgba(30, 41, 59, 0.5)",
                        transition: "all 0.2s ease",
                        color: textMain,
                        boxShadow: isLight ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none"
                    }}
                >
                    <span style={{ 
                        fontSize: "32px", 
                        marginBottom: "12px",
                        filter: isLight ? "none" : "drop-shadow(0 0 8px rgba(255,255,255,0.2))" 
                    }}>{action.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: textMain, textAlign: "center" }}>{action.label}</span>
                </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AdminLogin;
