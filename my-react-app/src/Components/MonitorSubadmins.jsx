import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";

function MonitorSubadmins() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // --- Original Logic State ---
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubAdmin, setNewSubAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/subadmins");
      setSubAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch subadmins:", err);
      alert("Failed to load subadmins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/subadmin/add", {
        name: newSubAdmin.name,
        email: newSubAdmin.email,
        password: newSubAdmin.password,
      });

      alert("SubAdmin added successfully!");
      setNewSubAdmin({ name: "", email: "", password: "" });
      setShowAddForm(false);
      fetchSubAdmins(); // Refresh the list
    } catch (err) {
      console.error("Failed to add subadmin:", err);
      alert(err.response?.data?.message || "Failed to add subadmin");
    }
  };

  const handleDeleteSubAdmin = async (subAdminId) => {
    if (!window.confirm("Are you sure you want to remove this subadmin?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/subadmin/${subAdminId}`);
      alert("SubAdmin removed successfully!");
      fetchSubAdmins(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete subadmin:", err);
      alert(err.response?.data?.message || "Failed to remove subadmin");
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

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
    background: isLight ? "#fff" : "#0f172a",
    color: textMain,
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const tableHeaderStyle = {
    color: textSub,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "16px",
    textAlign: "left",
    borderBottom: isLight
      ? "1px solid rgba(0,0,0,0.1)"
      : "1px solid rgba(255,255,255,0.1)",
  };

  const tableCellStyle = {
    color: textMain,
    fontSize: "13px",
    padding: "16px",
    borderBottom: isLight
      ? "1px solid rgba(0,0,0,0.05)"
      : "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle",
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
    gap: "5px",
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
        Loading...
      </div>
    );

  return (
    <>
      <Header title="Monitor Subadmins" userRole="admin" userName="Admin" />

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
              Monitor Subadmins
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

          {/* Add Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              ...buttonBase,
              background: showAddForm
                ? isLight
                  ? "#e2e8f0"
                  : "#334155"
                : "#22c55e",
              color: showAddForm ? textMain : "white",
              marginBottom: "20px",
            }}
          >
            {showAddForm ? "Cancel" : "+ Add New SubAdmin"}
          </button>

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                style={{ overflow: "hidden" }}
              >
                <form
                  onSubmit={handleAddSubAdmin}
                  style={{
                    padding: "24px",
                    borderRadius: "16px",
                    background: isLight
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(0,0,0,0.2)",
                    border: `1px solid ${
                      isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
                    }`,
                    marginBottom: "30px",
                    maxWidth: "500px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 20px 0",
                      fontSize: "18px",
                      color: textMain,
                    }}
                  >
                    Add New SubAdmin
                  </h3>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: textSub,
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={newSubAdmin.name}
                      onChange={(e) =>
                        setNewSubAdmin({ ...newSubAdmin, name: e.target.value })
                      }
                      required
                      style={inputStyle}
                      placeholder="Enter name"
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: textSub,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={newSubAdmin.email}
                      onChange={(e) =>
                        setNewSubAdmin({
                          ...newSubAdmin,
                          email: e.target.value,
                        })
                      }
                      required
                      style={inputStyle}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: textSub,
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      value={newSubAdmin.password}
                      onChange={(e) =>
                        setNewSubAdmin({
                          ...newSubAdmin,
                          password: e.target.value,
                        })
                      }
                      required
                      style={inputStyle}
                      placeholder="Create a password"
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      ...buttonBase,
                      background: "#3b82f6",
                      color: "white",
                      width: "100%",
                      padding: "10px",
                    }}
                  >
                    Add SubAdmin
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table List */}
          {subAdmins.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: textSub,
                background: isLight ? "rgba(255,255,255,0.4)" : "transparent",
                borderRadius: "12px",
              }}
            >
              No subadmins found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
                cellPadding={0}
                cellSpacing={0}
              >
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Name</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Total Complaints</th>
                    <th style={tableHeaderStyle}>Resolved Complaints</th>
                    <th style={tableHeaderStyle}>Created At</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {subAdmins.map((subAdmin) => (
                    <tr
                      key={subAdmin._id}
                      style={{
                        borderBottom: isLight
                          ? "1px solid rgba(0,0,0,0.05)"
                          : "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {subAdmin.imageUrl && (
                            <img
                              src={subAdmin.imageUrl}
                              alt={subAdmin.name}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                marginRight: "12px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <span style={{ fontWeight: 600 }}>
                            {subAdmin.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td style={tableCellStyle}>{subAdmin.email || "N/A"}</td>
                      <td style={tableCellStyle}>
                        {subAdmin.complaintsCount || 0}
                      </td>
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            color:
                              subAdmin.resolvedComplaintsCount > 0
                                ? "#22c55e"
                                : textSub,
                            fontWeight: "bold",
                          }}
                        >
                          {subAdmin.resolvedComplaintsCount || 0}
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, color: textSub }}>
                        {subAdmin.createdAt
                          ? new Date(subAdmin.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td style={tableCellStyle}>
                        <button
                          onClick={() => handleDeleteSubAdmin(subAdmin._id)}
                          style={{
                            ...buttonBase,
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

export default MonitorSubadmins;
