import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Header.jsx";

function AdminNotifications() {
  const [role, setRole] = useState("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await axios.get(
      "http://localhost:5000/admin/notifications"
    );
    setNotifications(res.data);
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

  return (
    <>
      <Header 
        title="Add Notifications" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Admin Notifications</h2>

      {/* ➕ ADD NOTIFICATION */}
      <form onSubmit={addNotification}>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ALL">All</option>
          <option value="STUDENT">Student</option>
          <option value="VENDOR">Vendor</option>
          <option value="SUBADMIN">Sub Admin</option>
        </select>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Add Notification"}
        </button>
      </form>

      <hr />

      {/* 📜 SHOW ALL NOTIFICATIONS */}
      <h3>All Notifications</h3>

      {notifications.length === 0 ? (
        <p>No notifications found</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n._id} style={{ marginBottom: "15px" }}>
              <b>{n.title}</b> <br />
              <small>
                Role: <b>{n.role}</b> |{" "}
                {new Date(n.createdAt).toLocaleString()}
              </small>
              <p>{n.message}</p>
            </li>
          ))}
        </ul>
      )}
      </div>
    </>
  );
}

export default AdminNotifications;
