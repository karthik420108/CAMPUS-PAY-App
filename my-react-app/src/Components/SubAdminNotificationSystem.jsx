import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

function SubAdminNotificationSystem() {
  const { state } = useLocation();
  const { subAdminId } = state || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayType, setOverlayType] = useState("success");
  const navigate = useNavigate();

  // Helper function to show overlay
  const showOverlayMessage = (message, type = "info") => {
    setOverlayMessage(message);
    setOverlayType(type);
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  useEffect(() => {
    fetchSubAdminNotifications();
  }, []);

  const fetchSubAdminNotifications = async () => {
    try {
      // Fetch notifications using existing endpoint
      const res = await axios.get("http://localhost:5000/notifications", {
        params: { 
          role: "SUBADMIN"
        },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch subadmin notifications:", err);
      setError("Failed to load notifications");
      showOverlayMessage("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%"
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "32px 16px"
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px"
        }}>
          <button
            onClick={() => navigate("/subadmin", { 
              state: { role: "SubAdmin", subAdminId }
            })}
            style={{
              padding: "12px 20px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              backdropFilter: "blur(10px)"
            }}
          >
            ← Back to Dashboard
          </button>
          
          <div style={{ textAlign: "center" }}>
            <h1 style={{ 
              color: "white", 
              margin: 0, 
              fontSize: "32px",
              fontWeight: "700",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              🔔 SubAdmin Notifications
            </h1>
            <p style={{ 
              color: "rgba(255,255,255,0.9)", 
              margin: "8px 0 0 0",
              fontSize: "16px"
            }}>
              Manage and view system notifications
            </p>
          </div>
          
          <button
            onClick={fetchSubAdminNotifications}
            style={{
              padding: "12px 20px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              backdropFilter: "blur(10px)"
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
              textAlign: "center",
              padding: "80px 40px",
              background: "rgba(255,255,255,0.95)",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
            <h3 style={{ 
              color: "#1f2937", 
              fontSize: "24px",
              marginBottom: "12px",
              fontWeight: "600"
            }}>
              No SubAdmin Notifications
            </h3>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "16px",
              lineHeight: "1.6"
            }}>
              You're all caught up! No new subadmin notifications at the moment.
            </p>
          </motion.div>
        ) : (
          <div style={{ 
            display: "grid", 
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))"
          }}>
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: "rgba(255,255,255,0.95)",
                  padding: "24px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  borderLeft: "4px solid #8b5cf6",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Notification Icon */}
                <div style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  fontSize: "24px",
                  opacity: 0.7
                }}>
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
                <h3 style={{ 
                  margin: "0 0 12px 0", 
                  color: "#1f2937", 
                  fontSize: "18px",
                  fontWeight: "600",
                  paddingRight: "40px"
                }}>
                  {notification.title}
                </h3>
                
                <p style={{ 
                  color: "#4b5563", 
                  lineHeight: "1.6", 
                  margin: "0 0 16px 0",
                  fontSize: "15px"
                }}>
                  {notification.message}
                </p>
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "16px",
                  borderTop: "1px solid rgba(0,0,0,0.1)"
                }}>
                  <span style={{ 
                    color: "#6b7280", 
                    fontSize: "13px",
                    fontWeight: "500"
                  }}>
                    {new Date(notification.createdAt).toLocaleDateString("en-US", {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  
                  <span style={{
                    padding: "4px 12px",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    color: "#8b5cf6",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {notification.category || "General"}
                  </span>
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
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: "white",
                padding: "32px 40px",
                borderRadius: "20px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
                maxWidth: "450px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>
                {overlayType === "success" && "✅"}
                {overlayType === "error" && "❌"}
                {overlayType === "info" && "ℹ️"}
              </div>
              <div style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: "12px"
              }}>
                {overlayType === "success" && "Success!"}
                {overlayType === "error" && "Error!"}
                {overlayType === "info" && "Information"}
              </div>
              <div style={{
                fontSize: "16px",
                color: "#6b7280",
                lineHeight: "1.6"
              }}>
                {overlayMessage}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SubAdminNotificationSystem;
