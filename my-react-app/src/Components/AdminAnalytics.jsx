import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header.jsx";

function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // week, month, year
  const { state } = useLocation();
  const navigate = useNavigate();

    useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch revenue analytics
        const revenueResponse = await axios.get(
          `http://localhost:5000/admin/analytics/revenue?period=${selectedPeriod}`
        );
        
        // Fetch daily analytics
        const dailyResponse = await axios.get(
          `http://localhost:5000/admin/analytics/daily?period=${selectedPeriod}`
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
      navigate(-1);
      return;
    }

    fetchAnalytics();
  }, [state, navigate, selectedPeriod]);



  const drawPieChart = (data, title, colors) => {
    if (!data || data.length === 0) return null;
    
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let currentAngle = -90; // Start from top
    
    return (
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1f2937" }}>
          {title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "30px" }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
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
              
              currentAngle = endAngle;
              
              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={100 + 40 * Math.cos(((currentAngle - angle/2) * Math.PI) / 180)}
                    y={100 + 40 * Math.sin(((currentAngle - angle/2) * Math.PI) / 180)}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {percentage.toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </svg>
          <div>
            <h4 style={{ margin: "0 0 10px 0", color: "#374151" }}>Top Vendors:</h4>
            {data.map((item, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: colors[index % colors.length],
                    marginRight: "8px",
                    borderRadius: "2px"
                  }}
                />
                <div style={{ fontSize: "14px", color: "#4b5563" }}>
                  <div style={{ fontWeight: "600" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    ₹{item.amount.toLocaleString()} ({((item.amount / total) * 100).toFixed(1)}%) • {item.count} transactions
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    Avg: ₹{item.avgAmount?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e5e7eb" }}>
              <strong style={{ color: "#1f2937" }}>Total Spending: ₹{total.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const drawBarChart = (data, title) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(item => item.amount));
    const barWidth = 40;
    const chartHeight = 200;
    
    return (
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#1f2937" }}>
          {title}
        </h3>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "center", gap: "15px", padding: "20px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          {data.map((item, index) => {
            const barHeight = (item.amount / maxValue) * chartHeight;
            return (
              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "5px" }}>
                  ₹{item.amount.toLocaleString()}
                </div>
                <div
                  style={{
                    width: `${barWidth}px`,
                    height: `${barHeight}px`,
                    backgroundColor: "#3b82f6",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease"
                  }}
                />
                <div style={{ fontSize: "12px", color: "#374151", marginTop: "5px", textAlign: "center" }}>
                  {item.label}
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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Loading Analytics...</h2>
      </div>
    );
  }

  const revenueColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const dailyColors = ["#06b6d4", "#84cc16", "#f97316", "#dc2626", "#7c3aed", "#db2777"];

  return (
    <>
      <Header 
        title="Analytics Dashboard" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2 style={{ margin: "0 0 30px 0", color: "#1f2937" }}>Analytics Dashboard</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <label style={{ color: "#374151", fontWeight: "500" }}>Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              color: "#374151"
            }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Vendor Spending Pie Chart */}
        <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {drawPieChart(revenueData, "Vendor Spending Analysis", revenueColors)}
        </div>

        {/* Daily Revenue */}
        <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {drawBarChart(dailyData.slice(0, 7), "Daily Spending")}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "30px" }}>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "14px" }}>Total Spending</h3>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "14px" }}>Transactions</h3>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#3b82f6" }}>
            {revenueData.reduce((sum, item) => sum + (item.count || 0), 0)}
          </p>
        </div>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "14px" }}>Top Vendors</h3>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
            {revenueData.length}
          </p>
        </div>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "14px" }}>Avg Transaction</h3>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#8b5cf6" }}>
            ₹{revenueData.length > 0 ? Math.round(revenueData.reduce((sum, item) => sum + (item.avgAmount || 0), 0) / revenueData.length).toLocaleString() : 0}
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

export default AdminAnalytics;
