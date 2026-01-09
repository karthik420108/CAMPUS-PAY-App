import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";
import { useAlert } from "../context/AlertContext";
import API_CONFIG from "../config/api";

function SubAdminProfile({ state }) {
  // --- Original Logic State ---
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    imageUrl: "",
  });
  const [isEditing, setIsEditing] = useState(state?.editMode || false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const subAdminId =
        state?.subAdminId || localStorage.getItem("subAdminId");
      if (!subAdminId) {
        showAlert({
          type: "error",
          title: "Authentication Error",
          message: "SubAdmin ID not found. Please log in again."
        });
        navigate("/");
        return;
      }
      const res = await axios.get(
        API_CONFIG.getUrl(`/subadmin/${subAdminId}/profile`)
      );
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showAlert({
        type: "error",
        title: "Loading Failed",
        message: "Failed to load profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.post(
        API_CONFIG.getUrl("/upload/subadmin"),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfile({ ...profile, imageUrl: res.data.url });
    } catch (err) {
      console.error("Failed to upload image:", err);
      showAlert({
        type: "error",
        title: "Upload Failed",
        message: "Failed to upload image"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const subAdminId =
        state?.subAdminId || localStorage.getItem("subAdminId");
      await axios.put(
        API_CONFIG.getUrl(`/subadmin/${subAdminId}/profile`),
        profile
      );
      showAlert({
        type: "success",
        title: "Profile Updated",
        message: "Profile updated successfully!"
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      showAlert({
        type: "error",
        title: "Update Failed",
        message: "Failed to update profile"
      });
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

  const subAdminId =
    state?.subAdminId || localStorage.getItem("subAdminId");

  if (loading) {
    return (
      <SubAdminStatusChecker subAdminId={subAdminId}>
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
          Loading profile...
        </div>
      </SubAdminStatusChecker>
    );
  }

  return (
    <SubAdminStatusChecker subAdminId={subAdminId}>
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
            maxWidth: "600px",
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
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "10px",
              }}
            >
              <button
                onClick={() =>
                  navigate("/subadmin", {
                    state: {
                      role: "SubAdmin",
                      subAdminId:
                        state?.subAdminId ||
                        localStorage.getItem("subAdminId"),
                    },
                  })
                }
                style={{
                  ...buttonBase,
                  background: isLight ? "#e2e8f0" : "#334155",
                  color: textMain,
                  padding: "8px 12px",
                }}
              >
                ← Back
              </button>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: textMain,
                }}
              >
                {isEditing ? "Edit Profile" : "Profile"}
              </h2>
            </div>
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

          {/* Profile Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={profile.name}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `4px solid ${
                    isLight ? "rgba(255,255,255,0.8)" : "rgba(30,41,59,0.8)"
                  }`,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  marginBottom: "20px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  fontSize: "48px",
                  color: "#94a3b8",
                  border: `4px solid ${
                    isLight ? "rgba(255,255,255,0.8)" : "rgba(30,41,59,0.8)"
                  }`,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
              >
                {profile.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            {isEditing && (
              <label
                style={{
                  padding: "8px 16px",
                  background: "#4f46e5",
                  color: "white",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "transform 0.1s",
                  display: "inline-block",
                }}
              >
                {uploading ? "Uploading..." : "Change Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Form / Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: textSub,
                  fontWeight: "600",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
                    background: isLight ? "#fff" : "#0f172a",
                    color: textMain,
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <p
                  style={{
                    margin: 0,
                    color: textMain,
                    fontSize: "18px",
                    fontWeight: "500",
                  }}
                >
                  {profile.name}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: textSub,
                  fontWeight: "600",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Email
              </label>
              <p
                style={{
                  margin: 0,
                  color: textMain,
                  fontSize: "16px",
                  fontFamily: "monospace",
                }}
              >
                {profile.email}
              </p>
            </div>

            {isEditing && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  style={{
                    ...buttonBase,
                    background: isLight ? "#e2e8f0" : "#334155",
                    color: textMain,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    ...buttonBase,
                    background: "#10b981",
                    color: "white",
                  }}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </SubAdminStatusChecker>
  );
}

export default SubAdminProfile;
