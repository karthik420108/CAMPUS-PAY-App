import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";

function SubAdminNotificationSystem() {
  const { state } = useLocation();
  const { subAdminId } = state || {};
  const navigate = useNavigate();

  // --- Original Logic State ---
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayType, setOverlayType] = useState("success");

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  // Helper function to show overlay
  const showOverlayMessage = (message, type = "info") => {
    setOverlayMessage(message);
    setOverlayType(type);
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  useEffect(() => {
    fetchSubAdminNotifications();

    // Set up polling for real-time updates
    const interval = setInterval(fetchSubAdminNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchSubAdminNotifications = async () => {
    try {
      // Fetch notifications using user-specific endpoint to get proper read status
      const res = await axios.get(
        `http://localhost:5000/notifications/${subAdminId}`,
        {
          params: {
            role: "SUBADMIN",
          },
        }
      );

      const notifications = res.data;
      setNotifications(notifications);

      // Mark all unread notifications as read when subadmin views the notification page
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length > 0 && subAdminId) {
        const markPromises = unreadNotifications.map((notification) =>
          axios
            .post(
              `http://localhost:5000/notifications/${notification._id}/read`,
              {
                userId: subAdminId,
                role: "SUBADMIN",
              }
            )
            .catch((err) =>
              console.error("Error marking notification as read:", err)
            )
        );

        // Execute all mark as read requests in parallel
        await Promise.all(markPromises);

        // Update local state to reflect read status
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch subadmin notifications:", err);
      setError("Failed to load notifications");
      showOverlayMessage("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING CONSTANTS ---
  const isLight = theme === "light";
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
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
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

  const buttonBase = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.1s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  };

  const currentSubAdminId =
    subAdminId || localStorage.getItem("subAdminId");

  if (loading) {
    return (
      <SubAdminStatusChecker subAdminId={currentSubAdminId}>
        <div
          style={{
            ...pageStyle,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textMain,
          }}
        >
          <div
            style={{
              background: isLight
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(30, 41, 59, 0.95)",
              padding: "40px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              border: `1px solid ${
                isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
              }`,
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <h2
              style={{
                margin: "0 0 8px 0",
                color: textMain,
                fontSize: "24px",
              }}
            >
              Loading Notifications
            </h2>
            <p style={{ margin: 0, color: textSub }}>
              Please wait while we fetch your notifications...
            </p>
          </div>
        </div>
      </SubAdminStatusChecker>
    );
  }

  return (
    <SubAdminStatusChecker subAdminId={currentSubAdminId}>
      <motion.div
        style={{
          ...pageStyle,
          minHeight: "100vh",
          padding: "40px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Orbs */}
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
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: "100%",
            maxWidth: "1280px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 6px",
              borderRadius: 999,
              border: `1px solid ${
                isLight ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.4)"
              }`,
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.8)",
              zIndex: 20,
            }}
          >
            <span style={{ fontSize: 11, color: textSub, paddingLeft: 4 }}>
              Mode
            </span>
            <button
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

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
              marginTop: "40px", // spacing for theme toggle
            }}
          >
            <button
              onClick={() =>
                navigate("/subadmin", {
                  state: { role: "SubAdmin", subAdminId },
                })
              }
              style={{
                ...buttonBase,
                backgroundColor: isLight ? "#e2e8f0" : "#334155",
                color: textMain,
                padding: "10px 16px",
              }}
            >
              ← Back
            </button>

            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  color: textMain,
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: "700",
                }}
              >
                🔔 SubAdmin Notifications
              </h1>
              <p
                style={{
                  color: textSub,
                  margin: "8px 0 0 0",
                  fontSize: "16px",
                }}
              >
                Manage and view system notifications
              </p>
            </div>

            <button
              onClick={fetchSubAdminNotifications}
              style={{
                ...buttonBase,
                backgroundColor: isLight ? "#e2e8f0" : "#334155",
                color: textMain,
                padding: "10px 16px",
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                ...cardStyle,
                textAlign: "center",
                padding: "80px 40px",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
              <h3
                style={{
                  color: textMain,
                  fontSize: "24px",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                No SubAdmin Notifications
              </h3>
              <p
                style={{
                  color: textSub,
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                You're all caught up! No new subadmin notifications at the
                moment.
              </p>
            </motion.div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              }}
            >
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background: notification.read
                      ? isLight
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(30,41,59,0.6)"
                      : isLight
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(30,41,59,0.9)",
                    padding: "24px",
                    borderRadius: "16px",
                    boxShadow: notification.read
                      ? "0 4px 12px rgba(0,0,0,0.05)"
                      : "0 10px 30px rgba(0,0,0,0.1)",
                    borderLeft: notification.read
                      ? `4px solid ${isLight ? "#cbd5e1" : "#475569"}`
                      : "4px solid #8b5cf6",
                    backdropFilter: "blur(10px)",
                    position: "relative",
                    overflow: "hidden",
                    opacity: notification.read ? 0.8 : 1,
                    border: `1px solid ${
                      isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
                    }`,
                  }}
                >
                  {/* Red dot indicator for unread notifications */}
                  {!notification.read && (
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        boxShadow: "0 0 12px rgba(239, 68, 68, 0.6)",
                      }}
                    />
                  )}

                  {/* Notification Icon */}
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: notification.read ? "20px" : "40px",
                      fontSize: "24px",
                      opacity: notification.read ? 0.4 : 0.7,
                    }}
                  >
                    {notification.type === "success" && "✅"}
                    {notification.type === "warning" && "⚠️"}
                    {notification.type === "error" && "❌"}
                    {notification.type === "info" && "ℹ️"}
                    {notification.type === "student" && "👤"}
                    {notification.type === "vendor" && "🏪"}
                    {notification.type === "system" && "⚙️"}
                    {!notification.type && "📢"}
                  </div>

                  {/* Notification Content */}
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      color: notification.read ? textSub : textMain,
                      fontSize: "18px",
                      fontWeight: notification.read ? "500" : "600",
                      paddingRight: notification.read ? "40px" : "60px",
                    }}
                  >
                    {notification.title}
                  </h3>

                  <p
                    style={{
                      color: notification.read ? textSub : textMain,
                      lineHeight: "1.6",
                      margin: "0 0 16px 0",
                      fontSize: "15px",
                      opacity: 0.9,
                    }}
                  >
                    {notification.message}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: `1px solid ${
                        isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
                      }`,
                    }}
                  >
                    <span
                      style={{
                        color: textSub,
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {new Date(notification.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      {!notification.read && (
                        <span
                          style={{
                            padding: "4px 12px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          NEW
                        </span>
                      )}
                      <span
                        style={{
                          padding: "4px 12px",
                          backgroundColor: notification.read
                            ? isLight
                              ? "rgba(107, 114, 128, 0.1)"
                              : "rgba(148, 163, 184, 0.1)"
                            : "rgba(139, 92, 246, 0.1)",
                          color: notification.read ? textSub : "#8b5cf6",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {notification.category || "General"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Overlay Component */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                backdropFilter: "blur(4px)",
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                  background: isLight ? "#fff" : "#1e293b",
                  padding: "32px 40px",
                  borderRadius: "20px",
                  boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
                  maxWidth: "450px",
                  textAlign: "center",
                  border: `1px solid ${
                    isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>
                  {overlayType === "success" && "✅"}
                  {overlayType === "error" && "❌"}
                  {overlayType === "info" && "ℹ️"}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: textMain,
                    marginBottom: "12px",
                  }}
                >
                  {overlayType === "success" && "Success!"}
                  {overlayType === "error" && "Error!"}
                  {overlayType === "info" && "Information"}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: textSub,
                    lineHeight: "1.6",
                  }}
                >
                  {overlayMessage}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </SubAdminStatusChecker>
  );
}

export default SubAdminNotificationSystem;
