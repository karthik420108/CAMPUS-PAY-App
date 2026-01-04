import './Start.css'
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ title, userRole, userName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items based on role
  const getNavigationItems = () => {
    if (userRole === "admin") {
      return [
        { id: 1, label: "Dashboard", icon: "📊", action: () => navigate("/admin", { state: { role: "admin" } }) },
        { id: 2, label: "Add Institute Funds", icon: "💰", action: () => navigate("/add-funds", { state: { role: "admin" } }) },
        { id: 3, label: "Redeem Requests", icon: "💸", action: () => navigate("/rrequests", { state: { role: "admin" } }) },
        { id: 4, label: "Add Notification", icon: "📢", action: () => navigate("/add-notifications", { state: { role: "admin" } }) },
        { id: 5, label: "Monitor Subadmins", icon: "👥", action: () => navigate("/monitor-subadmins", { state: { role: "admin" } }) },
        { id: 6, label: "View Complaints", icon: "📝", action: () => navigate("/admin-complaints", { state: { role: "admin" } }) },
        { id: 7, label: "Vendor KYC", icon: "🆔", action: () => navigate("/admin-vendor-kyc", { state: { role: "admin" } }) },
        { id: 8, label: "Vendor Complaints", icon: "🏪", action: () => navigate("/admin-vendor-complaints", { state: { role: "admin" } }) },
        { id: 9, label: "Freeze Users", icon: "🥶", action: () => navigate("/freeze-users", { state: { role: "admin" } }) },
        { id: 10, label: "Logout", icon: "🚪", action: () => navigate("/") },
      ];
    } else if (userRole === "SubAdmin") {
      return [
        { id: 1, label: "Dashboard", icon: "📊", action: () => navigate("/subadmin", { state: { role: "SubAdmin" } }) },
        { id: 2, label: "View Complaints", icon: "📝", action: () => navigate("/subadmin", { state: { role: "SubAdmin" } }) },
        { id: 3, label: "Students & KYC", icon: "👥", action: () => navigate("/subadmin", { state: { role: "SubAdmin" } }) },
        { id: 4, label: "Logout", icon: "🚪", action: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
        }},
      ];
    } else if (userRole === "student") {
      return [
        { id: 1, label: "Dashboard", icon: "📊", action: () => navigate("/student-dashboard") },
        { id: 2, label: "Profile", icon: "👤", action: () => navigate("/student-profile") },
        { id: 3, label: "Transactions", icon: "💳", action: () => navigate("/student-transactions") },
        { id: 4, label: "Complaints", icon: "📝", action: () => navigate("/complaint-history") },
        { id: 5, label: "Logout", icon: "🚪", action: () => navigate("/") },
      ];
    } else if (userRole === "vendor") {
      return [
        { id: 1, label: "Dashboard", icon: "📊", action: () => navigate("/vendor-dashboard") },
        { id: 2, label: "Profile", icon: "👤", action: () => navigate("/vendor-profile") },
        { id: 3, label: "Transactions", icon: "💳", action: () => navigate("/vendor-transaction") },
        { id: 4, label: "KYC Status", icon: "🆔", action: () => navigate("/vendor-kyc") },
        { id: 5, label: "Complaints", icon: "📝", action: () => navigate("/vendor-complaints") },
        { id: 6, label: "Logout", icon: "🚪", action: () => navigate("/") },
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const styles = {
    header: {
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      zIndex: 30
    },
    headerContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
      padding: "0 16px",
      maxWidth: "1280px",
      margin: "0 auto"
    },
    hamburgerBtn: {
      padding: "8px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      color: "#6b7280"
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#111827",
      textAlign: "center",
      flex: 1
    },
    userProfile: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    avatar: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      color: "white",
      fontSize: "14px"
    },
    adminAvatar: {
      backgroundColor: "#3b82f6"
    },
    subadminAvatar: {
      backgroundColor: "#10b981"
    },
    studentAvatar: {
      backgroundColor: "#8b5cf6"
    },
    vendorAvatar: {
      backgroundColor: "#f59e0b"
    },
    sidebar: {
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "256px",
      backgroundColor: "white",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.3s ease-in-out",
      zIndex: 50
    },
    sidebarHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
      padding: "0 16px",
      borderBottom: "1px solid #e5e7eb"
    },
    sidebarTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827"
    },
    closeBtn: {
      padding: "8px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      color: "#6b7280"
    },
    nav: {
      padding: "20px 8px"
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px",
      marginBottom: "4px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      color: "#374151",
      fontSize: "14px",
      fontWeight: "500",
      width: "100%",
      textAlign: "left"
    },
    navItemHover: {
      backgroundColor: "#f3f4f6",
      color: "#111827"
    },
    navIcon: {
      marginRight: "12px",
      fontSize: "18px"
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 40
    }
  };

  const getAvatarColor = () => {
    switch (userRole) {
      case "admin": return styles.adminAvatar;
      case "SubAdmin": return styles.subadminAvatar;
      case "student": return styles.studentAvatar;
      case "vendor": return styles.vendorAvatar;
      default: return styles.adminAvatar;
    }
  };

  const getInitial = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    switch (userRole) {
      case "admin": return "A";
      case "SubAdmin": return "SA";
      case "student": return "S";
      case "vendor": return "V";
      default: return "U";
    }
  };

  return (
    <>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.hamburgerBtn}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            {sidebarOpen ? (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Header Title */}
          <h1 style={styles.title}>{title || "Dashboard"}</h1>

          {/* User Profile */}
          <div style={styles.userProfile}>
            <div style={{ ...styles.avatar, ...getAvatarColor() }}>
              {getInitial()}
            </div>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
              {userName || userRole || "User"}
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            style={styles.closeBtn}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav style={styles.nav}>
          <div>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                style={styles.navItem}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.navItemHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "transparent", color: "#374151" })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}

export default Header;