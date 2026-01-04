import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";

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
    imageUrl: ""
  });
  const [hasUnread, setHasUnread] = useState(false);

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

  /* ----------------------------------
     FETCH SUBADMIN PROFILE
  -----------------------------------*/
  useEffect(() => {
    if (!subAdminId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/subadmin/${subAdminId}/profile`
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load subadmin profile", err);
      }
    };

    fetchProfile();
  }, [subAdminId]);

  /* ----------------------------------
     NOTIFICATION FETCHING WITH REAL-TIME POLLING
  -----------------------------------*/
  useEffect(() => {
    if (!subAdminId) return;
    
    const fetchNotifications = () => {
      axios
        .get(`http://localhost:5000/notifications/${subAdminId}`, {
          params: { role: "SUBADMIN" },
        })
        .then((res) => {
          const notifications = res.data;
          const unread = notifications.some((n) => !n.read);
          setHasUnread(unread);
        })
        .catch(console.error);
    };

    // Initial fetch
    fetchNotifications();

    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [subAdminId]);

  if (loading) {
    return (
      <SubAdminStatusChecker subAdminId={subAdminId}>
        <div className="min-h-screen flex items-center justify-center text-xl">
          Loading SubAdmin Dashboard...
        </div>
      </SubAdminStatusChecker>
    );
  }

  return (
    <SubAdminStatusChecker subAdminId={subAdminId}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
      {/* ============================= HEADER ============================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px"
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
          SubAdmin Dashboard
        </h1>

        {/* PROFILE DROPDOWN */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={profileBtn}
          >
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt="Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
                style={avatar}
              />
            ) : (
              <div style={fallbackAvatar}>SA</div>
            )}

            <div>
              <div style={{ fontWeight: "600" }}>
                {profile.name || "SubAdmin"}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Administrator
              </div>
            </div>

            <span>{showProfileMenu ? "▲" : "▼"}</span>
          </button>

          {showProfileMenu && (
            <div style={dropdown}>
              {/* VIEW PROFILE */}
              <button
                style={menuBtn}
                onClick={() =>
                  navigate("/subadmin-profile", {
                    state: { role: "SubAdmin", subAdminId }
                  })
                }
              >
                👤 View Profile
              </button>

              {/* EDIT PROFILE */}
              <button
                style={menuBtn}
                onClick={() =>
                  navigate("/subadmin-edit", {
                    state: { role: "SubAdmin", subAdminId }
                  })
                }
              >
                ✏️ Edit Profile
              </button>

              {/* LOGOUT */}
              <button
                style={{ ...menuBtn, color: "#ef4444" }}
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================= ACTION CARDS ============================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px"
        }}
      >
        <button
          style={card}
          onClick={() =>
            navigate("/subadmin-complaints", {
              state: { role: "SubAdmin", subAdminId }
            })
          }
        >
          📝
          <h3>View Complaints</h3>
          <p>Manage student complaints</p>
        </button>

        <button
          style={card}
          onClick={() =>
            navigate("/subadmin-students", {
              state: { role: "SubAdmin", subAdminId }
            })
          }
        >
          👥
          <h3>Students & KYC</h3>
          <p>Verify and manage students</p>
        </button>

        <button
          style={{ ...card, position: "relative" }}
          onClick={() =>
            navigate("/subadmin-notification-system", {
              state: { role: "SubAdmin", subAdminId }
            })
          }
        >
          {hasUnread && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                zIndex: 10,
              }}
            />
          )}
          🔔
          <h3>Notifications</h3>
          <p>View system notifications</p>
        </button>
      </div>
      </div>
    </SubAdminStatusChecker>
  );
}

/* ============================= STYLES ============================= */

const profileBtn = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px 16px",
  borderRadius: "12px",
  border: "2px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer"
};

const avatar = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #10b981"
};

const fallbackAvatar = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#10b981",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: "bold"
};

const dropdown = {
  position: "absolute",
  right: 0,
  top: "110%",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  overflow: "hidden",
  minWidth: "200px"
};

const menuBtn = {
  width: "100%",
  padding: "12px 16px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer"
};

const card = {
  padding: "28px",
  borderRadius: "14px",
  border: "2px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  textAlign: "center"
};

export default SubAdminDashboard;
