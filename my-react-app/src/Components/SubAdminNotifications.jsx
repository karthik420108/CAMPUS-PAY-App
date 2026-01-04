import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

function SubAdminNotifications({ state }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/notifications", {
        params: { role: "SUBADMIN" },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
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
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                borderLeft: "4px solid #4f46e5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ margin: 0, color: "#1f2937", fontSize: "18px" }}>
                  {notification.title}
                </h3>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                {notification.message}
              </p>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}

export default SubAdminNotifications;





