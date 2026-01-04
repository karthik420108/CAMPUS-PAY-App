import axios from "axios";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";

function AdminNotifications() {
  const [role, setRole] = useState("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Theme state for styling
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
        const res = await axios.get("http://localhost:5000/admin/notifications");
        // Reverse array to show newest first, if backend doesn't already
        setNotifications(res.data.reverse());
    } catch (err) {
        console.error("Error fetching notifications", err);
    }
  };

  const addNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/admin/notification/add",
        { role, title, message }
      );

      setTitle("");
      setMessage("");
      setRole("ALL");
      fetchNotifications();
    } catch {
      alert("Failed to add notification");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING CONSTANTS & HELPERS ---
  const easingSoft = [0.16, 1, 0.3, 1]; // Custom Bezier for "Apple-like" smoothness
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const getRoleBadgeStyle = (roleType) => {
    const styles = {
        ALL: { bg: isLight ? "#e0e7ff" : "#312e81", text: isLight ? "#3730a3" : "#c7d2fe" },
        STUDENT: { bg: isLight ? "#dcfce7" : "#064e3b", text: isLight ? "#166534" : "#a7f3d0" },
        VENDOR: { bg: isLight ? "#fce7f3" : "#831843", text: isLight ? "#9d174d" : "#fbcfe8" },
        SUBADMIN: { bg: isLight ? "#ffedd5" : "#7c2d12", text: isLight ? "#9a3412" : "#fed7aa" },
    };
    return styles[roleType] || styles.ALL;
  };

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
        <Header title="Add Notifications" userRole="admin" userName="Admin" />
      </div>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* --- ADD NOTIFICATION FORM CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easingSoft }}
          style={{ 
              ...cardStyle, 
              borderRadius: "24px", 
              padding: "32px", 
              marginBottom: "40px",
              position: "relative" // Critical for Theme Toggle positioning
          }}
        >
          {/* --- Theme Switch Moved Inside Card --- */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 6px",
              borderRadius: 999,
              border: `1px solid ${isLight ? "rgba(148,163,184,0.4)" : "rgba(255,255,255,0.2)"}`,
              background: isLight ? "rgba(255,255,255,0.5)" : "rgba(15,23,42,0.5)",
              fontSize: 11,
            }}
          >
            <span style={{ color: textSub, paddingLeft: 4 }}>Mode</span>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "3px 10px",
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

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "24px" }}>
            <span style={{ fontSize: "28px" }}>📢</span>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: textMain, margin: 0 }}>Compose Notification</h2>
          </div>

          <form onSubmit={addNotification}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
                {/* Role Select */}
                <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: textSub, marginBottom: "6px" }}>Target Role</label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                            width: "100%", padding: "12px", borderRadius: "12px", outline: "none", cursor: "pointer",
                            transition: "border-color 0.2s",
                            ...inputStyle
                        }}
                    >
                        <option value="ALL">All Users</option>
                        <option value="STUDENT">Student</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="SUBADMIN">Sub Admin</option>
                    </select>
                </div>

                {/* Title Input */}
                <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: textSub, marginBottom: "6px" }}>Title</label>
                    <input
                        type="text"
                        placeholder="e.g. System Maintenance"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{
                            width: "100%", padding: "12px", borderRadius: "12px", outline: "none",
                            transition: "all 0.2s",
                            ...inputStyle
                        }}
                    />
                </div>
            </div>

            {/* Message Textarea */}
            <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: textSub, marginBottom: "6px" }}>Message</label>
                <textarea
                    placeholder="Type your announcement here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows="4"
                    style={{
                        width: "100%", padding: "12px", borderRadius: "12px", outline: "none", resize: "vertical", minHeight: "100px",
                        transition: "all 0.2s",
                        ...inputStyle
                    }}
                />
            </div>

            <motion.button 
              type="submit" 
              disabled={loading}
              layout
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 16px rgba(234, 88, 12, 0.2)" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ 
                width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange gradient
                color: "white", fontSize: "16px", fontWeight: "600", cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                transition: "background 0.3s"
              }}
            >
              {loading ? (
                  <>
                    <span>Processing</span>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        style={{ width: "16px", height: "16px", border: "2px solid white", borderTop: "2px solid transparent", borderRadius: "50%" }}
                    />
                  </>
              ) : "Publish Notification"}
            </motion.button>
          </form>
        </motion.div>

        {/* --- NOTIFICATIONS LIST --- */}
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: textMain, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                📜 History
            </h3>

            {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: textSub, ...cardStyle, borderRadius: "20px" }}>
                    <p>No notifications found</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <AnimatePresence initial={false}>
                        {notifications.map((n) => {
                             const badge = getRoleBadgeStyle(n.role);
                             return (
                                <motion.div 
                                    layout
                                    key={n._id}
                                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: easingSoft }}
                                    style={{
                                        ...cardStyle,
                                        borderRadius: "16px",
                                        padding: "20px",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            {/* Role Badge */}
                                            <span style={{
                                                fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em",
                                                padding: "4px 8px", borderRadius: "6px",
                                                backgroundColor: badge.bg, color: badge.text
                                            }}>
                                                {n.role}
                                            </span>
                                            {/* Date */}
                                            <span style={{ fontSize: "12px", color: textSub }}>
                                                {new Date(n.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: "16px", fontWeight: "700", color: textMain, marginBottom: "6px" }}>
                                        {n.title}
                                    </div>
                                    <div style={{ fontSize: "14px", color: textSub, lineHeight: "1.5" }}>
                                        {n.message}
                                    </div>
                                </motion.div>
                             );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
      </main>
    </div>
  );
}

export default AdminNotifications;
