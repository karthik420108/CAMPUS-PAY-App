import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";
import { useAlert } from "../context/AlertContext";

function SubAdminNotifications({ state }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/notifications/${state?.subAdminId}`, {
        params: { role: "SUBADMIN" },
      });
      
      const notifications = res.data;
      setNotifications(notifications);

      // Mark all unread notifications as read when subadmin views the notification page
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0 && state?.subAdminId) {
        const markPromises = unreadNotifications.map(notification => 
          axios.post(`http://localhost:5000/notifications/${notification._id}/read`, {
            userId: state.subAdminId,
            role: "SUBADMIN",
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
      console.error("Failed to fetch notifications:", err);
      showAlert({
        type: "error",
        title: "Loading Failed",
        message: "Failed to load notifications"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <SubAdminStatusChecker subAdminId={state?.subAdminId || localStorage.getItem('subAdminId')}>
      <p>Loading notifications...</p>
    </SubAdminStatusChecker>
  );

  const subAdminId = state?.subAdminId || localStorage.getItem('subAdminId');

  return (
    <SubAdminStatusChecker subAdminId={subAdminId}>
      <>
      <Header 
        title="SubAdmin Notifications" 
        userRole="SubAdmin" 
        userName="SubAdmin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2 style={{ marginBottom: "30px", color: "#1f2937" }}>Notifications</h2>

      {notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "18px" }}>
            No notifications found
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              style={{
                background: notification.read ? "#f9fafb" : "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: notification.read 
                  ? "0 1px 3px rgba(0,0,0,0.1)" 
                  : "0 4px 6px rgba(0,0,0,0.1)",
                borderLeft: notification.read 
                  ? "4px solid #d1d5db" 
                  : "4px solid #4f46e5",
                position: "relative",
                opacity: notification.read ? 0.8 : 1,
              }}
            >
              {!notification.read && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: notification.read ? "#6b7280" : "#1f2937", 
                  fontSize: "18px",
                  fontWeight: notification.read ? "500" : "600"
                }}>
                  {notification.title}
                </h3>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ 
                color: notification.read ? "#9ca3af" : "#6b7280", 
                lineHeight: "1.6", 
                margin: 0 
              }}>
                {notification.message}
              </p>
              {!notification.read && (
                <div style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#4f46e5",
                  fontWeight: "600"
                }}>
                  NEW
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </>
    </SubAdminStatusChecker>
  );
}

export default SubAdminNotifications;





