import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

function AdminLogin() {
  const [ib, setIb] = useState(0);
  const [ur, setUr] = useState(0);
  const [vr, setVr] = useState(0);
  const [sr, setSr] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dashboard data fetching
  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data from backend...");
      const response = await axios.get("http://localhost:5000/admin/dashboard");
      console.log("Dashboard response:", response.data);
      setIb(response.data.instituteFunds || 0);
      setUr(response.data.userCount || 0);
      setVr(response.data.vendorCount || 0);
      setSr(response.data.subadminCount || 0);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set default values if API fails
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
    { label: "Institute Funds", value: `₹${ib.toLocaleString()}`, icon: "💰", color: "#10b981" },
    { label: "Users Registered", value: ur, icon: "👤", color: "#3b82f6" },
    { label: "Vendors Registered", value: vr, icon: "🏪", color: "#8b5cf6" },
    { label: "Subadmins Assigned", value: sr || 0, icon: "👨‍💼", color: "#f59e0b" },
  ];

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      fontFamily: "Arial, sans-serif"
    },
    main: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "32px 16px"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "24px",
      marginBottom: "32px"
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden"
    },
    statCardContent: {
      padding: "20px"
    },
    statCardHeader: {
      display: "flex",
      alignItems: "center"
    },
    statIcon: {
      padding: "12px",
      borderRadius: "6px",
      color: "white",
      fontSize: "20px"
    },
    statInfo: {
      marginLeft: "16px",
      flex: 1
    },
    statLabel: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "4px"
    },
    statValue: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827"
    },
    quickActions: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "24px"
    },
    quickActionsTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "16px"
    },
    quickActionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px"
    },
    quickActionBtn: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease"
    },
    quickActionBtnHover: {
      borderColor: "#3b82f6",
      backgroundColor: "#eff6ff"
    },
    quickActionIcon: {
      fontSize: "24px",
      marginBottom: "8px"
    },
    quickActionLabel: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#111827"
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#6b7280" }}>Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Universal Header */}
      <Header 
        title="Admin Dashboard" 
        userRole="admin" 
        userName="Admin" 
      />

      {/* Main Content */}
      <main style={styles.main}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={styles.statCardContent}>
                <div style={styles.statCardHeader}>
                  <div style={{ ...styles.statIcon, backgroundColor: stat.color }}>
                    {stat.icon}
                  </div>
                  <div style={styles.statInfo}>
                    <div style={styles.statLabel}>{stat.label}</div>
                    <div style={styles.statValue}>{stat.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
          <div style={styles.quickActionsGrid}>
            <button
              onClick={() => navigate("/add-funds", { state: { role: "admin" } })}
              style={styles.quickActionBtn}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.quickActionBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "#e5e7eb", backgroundColor: "white" })}
            >
              <span style={styles.quickActionIcon}>💰</span>
              <span style={styles.quickActionLabel}>Add Institute Funds</span>
            </button>
            <button
              onClick={() => navigate("/rrequests", { state: { role: "admin" } })}
              style={styles.quickActionBtn}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.quickActionBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "#e5e7eb", backgroundColor: "white" })}
            >
              <span style={styles.quickActionIcon}>💸</span>
              <span style={styles.quickActionLabel}>Redeem Requests</span>
            </button>
            <button
              onClick={() => navigate("/add-notifications", { state: { role: "admin" } })}
              style={styles.quickActionBtn}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.quickActionBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "#e5e7eb", backgroundColor: "white" })}
            >
              <span style={styles.quickActionIcon}>📢</span>
              <span style={styles.quickActionLabel}>Add Notification</span>
            </button>
            <button
              onClick={() => navigate("/admin-complaints", { state: { role: "admin" } })}
              style={styles.quickActionBtn}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.quickActionBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "#e5e7eb", backgroundColor: "white" })}
            >
              <span style={styles.quickActionIcon}>📝</span>
              <span style={styles.quickActionLabel}>View Complaints</span>
            </button>
            <button
              onClick={() => navigate("/admin-monitor-vendors", { state: { role: "admin" } })}
              style={styles.quickActionBtn}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.quickActionBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "#e5e7eb", backgroundColor: "white" })}
            >
              <span style={styles.quickActionIcon}>🏪</span>
              <span style={styles.quickActionLabel}>Monitor Vendors</span>
            </button>
            <button
              onClick={() => navigate("/admin-monitor-students", { state: { role: "admin" } })}
              style={styles.quickActionBtn}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.quickActionBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { borderColor: "#e5e7eb", backgroundColor: "white" })}
            >
              <span style={styles.quickActionIcon}>👨‍🎓</span>
              <span style={styles.quickActionLabel}>Monitor Students</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLogin;
