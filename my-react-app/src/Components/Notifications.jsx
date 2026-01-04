import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";

function Notifications() {
  const { state } = useLocation();
  const { Id } = state || {};
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light"); // "light" | "dark"

  const isLight = theme === "light";

  // ---------- THEME STYLES ----------
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

  useEffect(() => {
    if (!Id) {
      navigate("/");
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/notifications/${Id}`,
          {
            params: { role: state.role }, // state.role = STUDENT / VENDOR / SUBADMIN
          }
        );

        const notifications = res.data || [];
        setNotifications(notifications);

        // Mark all unread notifications as read when user views the notification page
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          const markPromises = unreadNotifications.map(notification => 
            axios.post(`http://localhost:5000/notifications/${notification._id}/read`, {
              userId: Id,
              role: state.role,
            }).catch(err => console.error("Error marking notification as read:", err))
          );
          
          // Execute all mark as read requests in parallel
          await Promise.all(markPromises);
          
          // Update local state to reflect read status
          setNotifications(prev => 
            prev.map(n => ({ ...n, read: true }))
          );
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [Id, navigate, state]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...pageStyle,
        }}
      >
        <motion.div
          style={{
            textAlign: "center",
            color: textMain,
            padding: "40px",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: `4px solid ${
                isLight ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.2)"
              }`,
              borderTop: `4px solid ${isLight ? "#3b82f6" : "#60a5fa"}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ fontSize: 16, margin: 0 }}>Loading notifications...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        minHeight: "100vh",
        padding: "24px",
        overflow: "hidden",
        position: "relative",
        ...pageStyle,
      }}
    >
      {/* Gradient Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          top: 28,
          left: 28,
          padding: "10px 16px",
          borderRadius: 16,
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 100,
          background: isLight
            ? "linear-gradient(135deg, #3b82f6, #0ea5e9)" // Light mode gradient
            : "linear-gradient(135deg, #0ea5e9, #3b82f6)", // Dark mode gradient
          color: "#fff",
          boxShadow: isLight
            ? "0 8px 24px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.3)"
            : "0 10px 28px rgba(15,23,42,0.8), 0 0 0 1px rgba(30,64,175,0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        ← Back
      </motion.button>

      {/* Background Orbs */}
      <motion.div
        style={{
          position: "fixed",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
            : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
          filter: "blur(40px)",
          opacity: 0.5,
          top: -40,
          left: -60,
          mixBlendMode: isLight ? "normal" : "screen",
          zIndex: 1,
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "fixed",
          width: 210,
          height: 210,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
            : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
          filter: "blur(34px)",
          opacity: 0.5,
          bottom: -40,
          right: -40,
          mixBlendMode: isLight ? "normal" : "screen",
          zIndex: 1,
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 800,
          margin: "0 auto",
          paddingTop: 120,
          paddingBottom: 40,
        }}
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            width: "100%",
            background: isLight
              ? "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(239,246,255,0.9))"
              : "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95))",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: "32px 40px",
            border: `1px solid ${
              isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)"
            }`,
            boxShadow: isLight
              ? "0 20px 48px rgba(15,23,42,0.15)"
              : "0 25px 60px rgba(15,23,42,0.9)",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
                🔔
              </span>
            </motion.div>
            <div>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: textMain,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Notifications
              </h1>
              <p style={{ fontSize: 16, color: textSub, margin: 4 }}>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              style={{
                border: "none",
                borderRadius: 999,
                padding: "4px 12px",
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
        </motion.div>

        {/* Notifications List */}
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: "center",
                padding: "80px 40px",
                color: textSub,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: isLight
                    ? "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(14,165,233,0.1))"
                    : "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(14,165,233,0.3))",
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 48 }}>📭</span>
              </div>
              <h3 style={{ color: textMain, fontSize: 24, marginBottom: 8 }}>
                No notifications yet
              </h3>
              <p style={{ fontSize: 16, maxWidth: 400, margin: "0 auto" }}>
                You'll see payment updates and important alerts here when they
                arrive.
              </p>
            </motion.div>
          ) : (
            notifications.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: isLight
                    ? note.read
                      ? "rgba(248,250,252,0.7)"
                      : "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(14,165,233,0.1))"
                    : note.read
                    ? "rgba(30,41,59,0.6)"
                    : "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(14,165,233,0.2))",
                  border: `1px solid ${
                    note.read
                      ? isLight
                        ? "rgba(209,213,219,0.5)"
                        : "rgba(51,65,85,0.6)"
                      : isLight
                      ? "rgba(59,130,246,0.3)"
                      : "rgba(59,130,246,0.5)"
                  }`,
                  borderRadius: 20,
                  padding: "24px 28px",
                  marginBottom: 16,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: isLight
                    ? "0 20px 40px rgba(15,23,42,0.15)"
                    : "0 25px 50px rgba(15,23,42,0.9)",
                }}
              >
                {!note.read && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#3b82f6",
                      boxShadow: "0 0 12px rgba(59,130,246,0.6)",
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: note.read
                        ? "linear-gradient(135deg, rgba(148,163,184,0.3), rgba(156,163,175,0.2))"
                        : note.type === "success" ? "linear-gradient(135deg, #10b981, #059669)" :
                          note.type === "error" ? "linear-gradient(135deg, #ef4444, #dc2626)" :
                          note.type === "warning" ? "linear-gradient(135deg, #f59e0b, #d97706)" :
                          "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: "white", fontSize: 20 }}>
                      {note.read ? "📋" : 
                       note.type === "success" ? "✅" :
                       note.type === "error" ? "❌" :
                       note.type === "warning" ? "⚠️" : "🔔"}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: 18,
                        fontWeight: note.read ? 600 : 800,
                        color: note.read ? textSub : textMain,
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {note.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 15,
                        color: textSub,
                        margin: "8px 0 0 0",
                        lineHeight: 1.6,
                      }}
                    >
                      {note.message}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: textSub,
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(note.createdAt)}
                  </span>
                  {!note.read && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#3b82f6",
                        padding: "4px 12px",
                        borderRadius: 12,
                        background: isLight
                          ? "rgba(59,130,246,0.15)"
                          : "rgba(59,130,246,0.25)",
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
}

export default Notifications;
