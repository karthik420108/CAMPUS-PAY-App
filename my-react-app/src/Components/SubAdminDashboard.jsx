import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";
import Header from "./Header3";
import API_CONFIG from "../config/api";

function SubAdminDashboard() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [subAdminId] = useState(
    state?.subAdminId || localStorage.getItem("subAdminId")
  );
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    imageUrl: "",
  });
  const firstLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "";
  const [hasUnread, setHasUnread] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];

  useEffect(() => {
    if (!state || state.role !== "SubAdmin") {
      navigate("/");
      return;
    }

    if (state.subAdminId) {
      localStorage.setItem("subAdminId", state.subAdminId);
    }

    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, [state, navigate]);

  useEffect(() => {
    if (!subAdminId) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(API_CONFIG.getUrl(`/subadmin/${subAdminId}/profile`));
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load subadmin profile", err);
      }
    };
    fetchProfile();
  }, [subAdminId]);

  useEffect(() => {
    if (!subAdminId) return;
    const fetchNotifications = () => {
      axios.get(API_CONFIG.getUrl(`/notifications/${subAdminId}`), { params: { role: "SUBADMIN" } })
        .then((res) => {
          setHasUnread(res.data.some((n) => !n.read));
        })
        .catch(console.error);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [subAdminId]);

  // --- STYLES ---
  const pageStyle = isLight
    ? {
        background: "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%), radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
      }
    : {
        backgroundColor: "#020617",
        backgroundImage: "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%), radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%), linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.9) 1px, transparent 1px)",
        backgroundSize: "cover, cover, cover, cover, 80px 80px, 80px 80px",
        backgroundPosition: "center, center, center, center, 0 0, 0 0",
      };

  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const cardStyle = isLight
    ? {
        background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow: "0 16px 38px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.2)",
      }
    : {
        background: "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.65), 0 0 0 1px rgba(30,64,175,0.35)",
      };

  if (loading) {
    return (
      <SubAdminStatusChecker subAdminId={subAdminId}>
        <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: textSub, fontWeight: 500 }}>
          Loading SubAdmin Dashboard...
        </div>
      </SubAdminStatusChecker>
    );
  }

  return (
    <SubAdminStatusChecker subAdminId={subAdminId}>
      <Header/>
      <motion.div
        style={{
          minHeight: "100vh",
          padding: "32px 16px",
          position: "relative",
          overflow: "hidden",
          ...pageStyle,
        }}
      >
        {/* Background Orbs */}
        <motion.div
          style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: isLight ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)" : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)", filter: "blur(60px)", opacity: 0.4, top: -50, left: -50, zIndex: 0 }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
         <motion.div
          style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: isLight ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)" : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)", filter: "blur(50px)", opacity: 0.4, bottom: -50, right: -50, zIndex: 0 }}
          animate={{ x: [0, -30, 20, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          
          {/* ============================= HEADER ============================= */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "20px" }}>
            <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                style={{ display: "flex", flexDirection: "column" }}
            >
              <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: textSub, marginBottom: "4px" }}>
                Administration
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: textMain, margin: 0, letterSpacing: "-0.02em" }}>
                SubAdmin Dashboard
              </h1>
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Theme Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 999, border: "1px solid rgba(148,163,184,0.6)", background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)", fontSize: 11, backdropFilter: "blur(8px)" }}>
                <span style={{ color: "#6b7280", paddingLeft: 4 }}>Mode</span>
                <button type="button" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} style={{ border: "none", borderRadius: 999, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: isLight ? "linear-gradient(120deg,#020617,#0f172a)" : "linear-gradient(120deg,#e5f2ff,#dbeafe)", color: isLight ? "#e5e7eb" : "#0f172a" }}>
                    {isLight ? "Dark" : "Light"}
                </button>
              </div>

              {/* PROFILE DROPDOWN */}
              <div style={{ position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "6px 12px 6px 6px",
                    borderRadius: "14px", border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                    cursor: "pointer", backdropFilter: "blur(8px)",
                    background: isLight ? "rgba(255,255,255,0.6)" : "rgba(30,41,59,0.6)",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl} alt="Profile"
                      onError={() => setProfile((p) => ({ ...p, imageUrl: "" }))}
                      style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover", border: `1px solid ${isLight ? "#e2e8f0" : "#334155"}` }}
                    />
                  ) : (
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "14px" }}>{firstLetter || "S"}</div>
                  )}
                  <div style={{ textAlign: "left", marginRight: "4px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: textMain }}>{profile.name || "Admin"}</div>
                  </div>
                  <span style={{ color: textSub, fontSize: "10px" }}>▼</span>
                </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        background: isLight ? "#fff" : "#1e293b",
                        borderRadius: "16px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
                        overflow: "hidden", minWidth: "200px", zIndex: 100,
                        border: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
                      }}
                    >
                      <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button style={{ ...menuBtnStyle, color: textMain }} onMouseEnter={(e) => (e.target.style.background = isLight ? "#f3f4f6" : "#334155")} onMouseLeave={(e) => (e.target.style.background = "transparent")} onClick={() => navigate("/subadmin-profile", { state: { role: "SubAdmin", subAdminId } })}>
                          👤 View Profile
                        </button>
                        <button style={{ ...menuBtnStyle, color: textMain }} onMouseEnter={(e) => (e.target.style.background = isLight ? "#f3f4f6" : "#334155")} onMouseLeave={(e) => (e.target.style.background = "transparent")} onClick={() => navigate("/subadmin-edit", { state: { role: "SubAdmin", subAdminId } })}>
                          ✏️ Edit Profile
                        </button>
                        <div style={{ height: "1px", background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                        <button style={{ ...menuBtnStyle, color: "#ef4444" }} onMouseEnter={(e) => (e.target.style.background = isLight ? "#fef2f2" : "rgba(239,68,68,0.1)")} onMouseLeave={(e) => (e.target.style.background = "transparent")} onClick={() => { localStorage.clear(); navigate("/"); }}>
                          🚪 Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* SEPARATOR LINE */}
          <motion.div
            style={{
                height: 3, borderRadius: 999, marginBottom: 32,
                background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
                opacity: 0.9, width: "100%"
            }}
            animate={{ scaleX: [0.98, 1, 0.98] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ============================= ACTION CARDS ============================= */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            
            {/* View Complaints Card - SIDE ACCENT ONLY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.1)" : "0 20px 40px rgba(0,0,0,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/subadmin-complaints", { state: { role: "SubAdmin", subAdminId } })}
              style={{ ...cardStyle, padding: "28px", borderRadius: "24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
            >
              {/* Side Accent */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: "#f59e0b" }}></div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 8px 20px rgba(245, 158, 11, 0.25)" }}>
                    📝
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: textMain, margin: "0 0 6px" }}>View Complaints</h3>
                    <p style={{ margin: 0, color: textSub, fontSize: "14px", lineHeight: "1.5" }}>Manage student and vendor complaints effectively.</p>
                  </div>
              </div>
            </motion.div>

            {/* Students & KYC Card - SIDE ACCENT ONLY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              whileHover={{ y: -5, boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.1)" : "0 20px 40px rgba(0,0,0,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/subadmin-students", { state: { role: "SubAdmin", subAdminId } })}
              style={{ ...cardStyle, padding: "28px", borderRadius: "24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
            >
              {/* Side Accent */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: "#3b82f6" }}></div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)" }}>
                    👥
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: textMain, margin: "0 0 6px" }}>Students & KYC</h3>
                    <p style={{ margin: 0, color: textSub, fontSize: "14px", lineHeight: "1.5" }}>Verify student identities and manage accounts.</p>
                  </div>
              </div>
            </motion.div>

            {/* Notifications Card - SIDE ACCENT ONLY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.1)" : "0 20px 40px rgba(0,0,0,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/subadmin-notification-system", { state: { role: "SubAdmin", subAdminId } })}
              style={{ ...cardStyle, padding: "28px", borderRadius: "24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
            >
              {hasUnread && (
                <div style={{ position: "absolute", top: "20px", right: "20px", width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)", zIndex: 10 }} />
              )}
              
              {/* Side Accent */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: "#ec4899" }}></div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #ec4899, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 8px 20px rgba(236, 72, 153, 0.25)" }}>
                    🔔
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: textMain, margin: "0 0 6px" }}>Notifications</h3>
                    <p style={{ margin: 0, color: textSub, fontSize: "14px", lineHeight: "1.5" }}>Stay updated with system alerts.</p>
                  </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </SubAdminStatusChecker>
  );
}

const menuBtnStyle = {
  width: "100%", padding: "10px 12px", border: "none", background: "transparent",
  textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: "500",
  borderRadius: "8px", transition: "background 0.2s",
};

export default SubAdminDashboard;
