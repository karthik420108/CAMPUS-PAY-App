import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";
import API_CONFIG from "../config/api";

function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // week, month, year
  const { state } = useLocation();
  const navigate = useNavigate();

  // Theme state
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch revenue analytics
        const revenueResponse = await axios.get(
          API_CONFIG.getUrl(`/admin/analytics/revenue?period=${selectedPeriod}`)
        );
        // Fetch daily analytics
        const dailyResponse = await axios.get(
          API_CONFIG.getUrl(`/admin/analytics/daily?period=${selectedPeriod}`)
        );
        
        setRevenueData(revenueResponse.data);
        setDailyData(dailyResponse.data);
        setTotalRevenue(revenueResponse.data.reduce((sum, item) => sum + item.amount, 0));
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }

    fetchAnalytics();
  }, [state, navigate, selectedPeriod]);

  // --- STYLING CONSTANTS ---
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

  const selectStyle = isLight 
    ? { background: "white", border: "1px solid #e2e8f0", color: textMain }
    : { background: "rgba(15, 23, 42, 0.6)", border: "1px solid #334155", color: "white" };


  // --- CHART HELPERS ---
  const revenueColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  // For daily bar chart - simplified single color or gradients
  const barGradient = isLight ? "linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)" : "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)";


  const drawPieChart = (data, title, colors) => {
    if (!data || data.length === 0) return (
      <div style={{ padding: 40, textAlign: "center", color: textSub }}>No data available</div>
    );
    
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let currentAngle = -90; 
    
    return (
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "30px", fontSize: "18px", fontWeight: "700", color: textMain }}>
          {title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
          
          {/* Animated SVG Pie Chart */}
          <div style={{ position: "relative", width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 200 200" style={{ transform: "rotate(0deg)" }}>
                {data.map((item, index) => {
                const percentage = (item.amount / total) * 100;
                const angle = (percentage / 100) * 360;
                const endAngle = currentAngle + angle;
                
                const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                ].join(' ');
                
                const midAngle = currentAngle + angle / 2;
                const labelX = 100 + 55 * Math.cos((midAngle * Math.PI) / 180);
                const labelY = 100 + 55 * Math.sin((midAngle * Math.PI) / 180);

                currentAngle = endAngle;
                
                return (
                    <motion.g 
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                    <path
                        d={pathData}
                        fill={colors[index % colors.length]}
                        stroke={isLight ? "white" : "#1e293b"}
                        strokeWidth="2"
                    />
                    {percentage > 5 && (
                        <text
                            x={labelX}
                            y={labelY}
                            fill="white"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                        >
                            {percentage.toFixed(0)}%
                        </text>
                    )}
                    </motion.g>
                );
                })}
            </svg>
          </div>

          {/* Legend / List */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h4 style={{ margin: "0 0 15px 0", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", color: textSub }}>Top Vendors</h4>
            {data.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
              >
                <div
                  style={{
                    width: "12px", height: "12px",
                    backgroundColor: colors[index % colors.length],
                    marginRight: "10px", borderRadius: "3px"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: textMain }}>{item.name}</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: textMain }}>₹{item.amount.toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: textSub, display: "flex", justifyContent: "space-between" }}>
                     <span>{item.count} txns</span>
                     <span>Avg: ₹{Math.round(item.avgAmount || 0)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: `1px solid ${isLight ? "#e5e7eb" : "#334155"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: textMain, fontWeight: "700" }}>
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const drawBarChart = (data, title) => {
    if (!data || data.length === 0) return (
        <div style={{ padding: 40, textAlign: "center", color: textSub }}>No data available</div>
    );
    
    const maxValue = Math.max(...data.map(item => item.amount));
    const chartHeight = 220;
    
    return (
      <div style={{ marginBottom: "10px", height: "100%", display: "flex", flexDirection: "column" }}>
        <h3 style={{ textAlign: "center", marginBottom: "30px", fontSize: "18px", fontWeight: "700", color: textMain }}>
          {title}
        </h3>
        <div style={{ 
            display: "flex", alignItems: "end", justifyContent: "space-around", 
            gap: "8px", padding: "24px 10px", 
            backgroundColor: isLight ? "rgba(249,250,251,0.5)" : "rgba(15,23,42,0.3)", 
            borderRadius: "16px", flex: 1 
        }}>
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.amount / maxValue) * chartHeight : 0;
            return (
              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    style={{ fontSize: "11px", fontWeight: "600", color: textSub, marginBottom: "8px" }}
                >
                  ₹{item.amount > 1000 ? (item.amount/1000).toFixed(1) + 'k' : item.amount}
                </motion.div>
                
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(barHeight, 4)}px` }}
                  transition={{ duration: 0.8, ease: easingSoft, delay: index * 0.1 }}
                  style={{
                    width: "30px",
                    background: barGradient,
                    borderRadius: "6px 6px 2px 2px",
                    boxShadow: isLight ? "0 4px 6px -1px rgba(59,130,246,0.3)" : "none"
                  }}
                />
                
                <div style={{ fontSize: "12px", fontWeight: "500", color: textMain, marginTop: "12px", textAlign: "center" }}>
                  {item.label.substring(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: "20px", fontWeight: "600", color: textSub }}
        >
            Loading Analytics...
        </motion.div>
      </div>
    );
  }

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
        <Header title="Analytics Dashboard" userRole="admin" userName="Admin" />
      </div>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Controls Header */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}
        >
             <div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: textMain, margin: 0, letterSpacing: "-0.02em" }}>Analytics Dashboard</h2>
                <p style={{ color: textSub, marginTop: "4px" }}>Overview of platform performance</p>
             </div>
             
             <div style={{ display: "flex", alignItems: "center", gap: "12px", background: isLight ? "white" : "rgba(30,41,59,0.5)", padding: "8px 12px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <label style={{ color: textSub, fontSize: "13px", fontWeight: "600" }}>Period:</label>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    style={{
                        padding: "6px 12px", borderRadius: "8px", outline: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500",
                        ...selectStyle
                    }}
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
             </div>
        </motion.div>

        {/* Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px", marginBottom: "30px" }}>
            {/* Pie Chart Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ ...cardStyle, borderRadius: "24px", padding: "30px" }}
            >
                {drawPieChart(revenueData, "Vendor Spending Analysis", revenueColors)}
            </motion.div>

            {/* Bar Chart Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ ...cardStyle, borderRadius: "24px", padding: "30px" }}
            >
                {drawBarChart(dailyData.slice(0, 7), "Daily Spending Trend")}
            </motion.div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {[
                { title: "Total Spending", value: `₹${totalRevenue.toLocaleString()}`, color: "#10b981", delay: 0.2 },
                { title: "Transactions", value: revenueData.reduce((sum, item) => sum + (item.count || 0), 0), color: "#3b82f6", delay: 0.3 },
                { title: "Active Vendors", value: revenueData.length, color: "#f59e0b", delay: 0.4 },
                { 
                  title: "Avg Transaction", 
                  value: `₹${revenueData.length > 0 ? Math.round(revenueData.reduce((sum, item) => sum + (item.avgAmount || 0), 0) / revenueData.length).toLocaleString() : 0}`, 
                  color: "#8b5cf6", delay: 0.5 
                }
            ].map((stat, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: stat.delay, duration: 0.4 }}
                    whileHover={{ y: -5 }}
                    style={{ ...cardStyle, padding: "24px", borderRadius: "16px", textAlign: "center" }}
                >
                    <h3 style={{ margin: "0 0 10px 0", color: textSub, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>{stat.title}</h3>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: stat.color, letterSpacing: "-0.03em" }}>
                        {stat.value}
                    </p>
                </motion.div>
            ))}
        </div>

      </main>
    </div>
  );
}

export default AdminAnalytics;
