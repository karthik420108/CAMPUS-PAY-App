import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";
import { useAlert } from "../context/AlertContext";

function FreezeUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate(-1);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users");
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [state, navigate]);

  const handleFreezeToggle = async (userId, currentFreezeStatus) => {
    try {
      await axios.put(`http://localhost:5000/user/${userId}/freeze`, {
        isFrozen: !currentFreezeStatus,
      });

      // Refresh users list
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);

      showAlert({
        type: "success",
        title: "Status Updated",
        message: `User ${!currentFreezeStatus ? "frozen" : "unfrozen"} successfully!`
      });
    } catch (err) {
      console.error("Error updating freeze status:", err);
      showAlert({
        type: "error",
        title: "Update Failed",
        message: "Failed to update freeze status"
      });
    }
  };

  const handleFreezeAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to freeze ALL users? This will prevent all users from accessing their accounts."
      )
    ) {
      return;
    }

    try {
      // Get all unfrozen users
      const unfrozenUsers = users.filter((user) => !user.isFrozen);

      if (unfrozenUsers.length === 0) {
        showAlert({
          type: "info",
          title: "All Users Frozen",
          message: "All users are already frozen!"
        });
        return;
      }

      // Freeze all users in parallel
      await Promise.all(
        unfrozenUsers.map((user) =>
          axios.put(`http://localhost:5000/user/${user._id}/freeze`, {
            isFrozen: true,
          })
        )
      );

      // Refresh users list
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);

      showAlert({
        type: "success",
        title: "Bulk Freeze Complete",
        message: `Successfully frozen ${unfrozenUsers.length} users!`
      });
    } catch (err) {
      console.error("Error freezing all users:", err);
      showAlert({
        type: "error",
        title: "Bulk Action Failed",
        message: "Failed to freeze all users"
      });
    }
  };

  const handleUnfreezeAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to unfreeze ALL users? This will allow all users to access their accounts."
      )
    ) {
      return;
    }

    try {
      // Get all frozen users
      const frozenUsers = users.filter((user) => user.isFrozen);

      if (frozenUsers.length === 0) {
        showAlert({
          type: "info",
          title: "All Users Active",
          message: "All users are already active!"
        });
        return;
      }

      // Unfreeze all users in parallel
      await Promise.all(
        frozenUsers.map((user) =>
          axios.put(`http://localhost:5000/user/${user._id}/freeze`, {
            isFrozen: false,
          })
        )
      );

      // Refresh users list
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);

      showAlert({
        type: "success",
        title: "Bulk Unfreeze Complete",
        message: `Successfully unfrozen ${frozenUsers.length} users!`
      });
    } catch (err) {
      console.error("Error unfreezing all users:", err);
      showAlert({
        type: "error",
        title: "Bulk Action Failed",
        message: "Failed to unfreeze all users"
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.collegeEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
    background: isLight ? "#fff" : "#0f172a",
    color: textMain,
    outline: "none",
    fontSize: "14px",
    width: "100%",
    maxWidth: "350px",
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

  const listItemStyle = {
    padding: "16px",
    borderRadius: "12px",
    background: isLight
      ? "rgba(255,255,255,0.6)"
      : "rgba(255,255,255,0.03)",
    border: `1px solid ${
      isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
    }`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  };

  if (loading)
    return (
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
        Loading users...
      </div>
    );

  return (
    <>
      <Header title="Freeze Users" userRole="admin" userName="Admin" />

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
        {/* Background Orbs */}
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

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: "1280px",
            borderRadius: 28,
            padding: "30px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            position: "relative",
            marginTop: "20px",
            ...cardStyle,
          }}
        >
          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 6px",
              borderRadius: 999,
              border: `1px solid ${
                isLight ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.4)"
              }`,
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.8)",
              zIndex: 10,
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

          {/* Header Section */}
          <div style={{ marginBottom: "25px" }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: textSub,
                marginBottom: 6,
              }}
            >
              Admin Dashboard
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: textMain,
                margin: 0,
              }}
            >
              Freeze/Unfreeze Users
            </h2>
            <div
              style={{
                height: 2,
                width: "100%",
                background:
                  "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
                marginTop: 15,
                opacity: 0.8,
                borderRadius: 999,
              }}
            />
          </div>

          {/* Controls: Search & Bulk Actions */}
          <div
            style={{
              marginBottom: "24px",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleFreezeAll}
                style={{
                  ...buttonBase,
                  background: "rgba(220,53,69,0.1)",
                  color: "#dc3545",
                  border: "1px solid rgba(220,53,69,0.3)",
                }}
              >
                🥶 Freeze All
              </button>

              <button
                onClick={handleUnfreezeAll}
                style={{
                  ...buttonBase,
                  background: "rgba(40,167,69,0.1)",
                  color: "#28a745",
                  border: "1px solid rgba(40,167,69,0.3)",
                }}
              >
                🔥 Unfreeze All
              </button>
            </div>
          </div>

          {/* Users List */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <AnimatePresence>
              {filteredUsers.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: textSub,
                    background: isLight
                      ? "rgba(255,255,255,0.4)"
                      : "transparent",
                    borderRadius: "12px",
                  }}
                >
                  No users found.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={listItemStyle}
                  >
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          color: textMain,
                          fontSize: "16px",
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </h4>
                      <div
                        style={{ fontSize: "13px", color: textSub, marginBottom: "4px" }}
                      >
                        {user.collegeEmail}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "12px",
                          color: textSub,
                          marginTop: "6px",
                        }}
                      >
                        <span style={{ fontWeight: 500, color: textMain }}>
                          Wallet: ₹{user.walletBalance || 0}
                        </span>
                        <span>
                          Joined:{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: user.isFrozen
                            ? "rgba(220,53,69,0.15)"
                            : "rgba(40,167,69,0.15)",
                          color: user.isFrozen ? "#dc3545" : "#28a745",
                          border: `1px solid ${
                            user.isFrozen
                              ? "rgba(220,53,69,0.2)"
                              : "rgba(40,167,69,0.2)"
                          }`,
                        }}
                      >
                        {user.isFrozen ? "FROZEN" : "ACTIVE"}
                      </span>

                      <button
                        onClick={() =>
                          handleFreezeToggle(user._id, user.isFrozen)
                        }
                        style={{
                          ...buttonBase,
                          backgroundColor: user.isFrozen
                            ? "#22c55e"
                            : "#ef4444",
                          color: "white",
                        }}
                      >
                        {user.isFrozen ? "Unfreeze" : "Freeze"}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              background: isLight
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.2)",
              borderRadius: "16px",
              border: `1px solid ${
                isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
              }`,
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: textSub }}>
                Total Users
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: textMain,
                }}
              >
                {users.length}
              </div>
            </div>
            <div style={{ width: 1, height: 40, background: isLight ? "#cbd5e1" : "#475569" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: textSub }}>Active</div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#22c55e",
                }}
              >
                {users.filter((u) => !u.isFrozen).length}
              </div>
            </div>
            <div style={{ width: 1, height: 40, background: isLight ? "#cbd5e1" : "#475569" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: textSub }}>Frozen</div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#ef4444",
                }}
              >
                {users.filter((u) => u.isFrozen).length}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default FreezeUsers;
