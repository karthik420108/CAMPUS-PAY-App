import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";

function SubAdminEdit() {
  const { state } = useLocation();
  const { subAdminId } = state || {};
  const navigate = useNavigate();

  // --- Original Logic State ---
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayType, setOverlayType] = useState("success"); // success, error, info

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  // Helper function to show overlay
  const showOverlayMessage = (message, type = "success") => {
    setOverlayMessage(message);
    setOverlayType(type);
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  useEffect(() => {
    if (!subAdminId) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/subadmin/${subAdminId}/profile`
        );
        setProfile(res.data);
        setImagePreview(res.data.imageUrl || null);
      } catch (err) {
        setError("Failed to load profile");
      }
    };
    fetchProfile();
  }, [subAdminId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // If image changed, upload it first and get the new URL
      const updatedProfile = { ...profile };
      if (imageFile) {
        const formData = new FormData();
        formData.append("profileImage", imageFile);

        const uploadRes = await axios.post(
          "http://localhost:5000/upload/subadmin",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (uploadRes && uploadRes.data && uploadRes.data.url) {
          updatedProfile.imageUrl = uploadRes.data.url;
          setImagePreview(uploadRes.data.url);
        }
      }

      // Update profile data (include imageUrl when available)
      const res = await axios.put(
        `http://localhost:5000/subadmin/${subAdminId}/profile`,
        {
          name: updatedProfile.name,
          imageUrl: updatedProfile.imageUrl,
        }
      );

      if (res && res.data && res.data.subAdmin) {
        setProfile(res.data.subAdmin);
      }

      showOverlayMessage("Profile Updated Successfully!", "success");
      setTimeout(() => {
        navigate("/subadmin", {
          state: {
            role: "SubAdmin",
            subAdminId,
            imageUrl: imagePreview || profile.imageUrl,
          },
        });
      }, 2000);
    } catch (err) {
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Remove profile photo?")) return;
    try {
      setLoading(true);
      setError("");

      const res = await axios.put(
        `http://localhost:5000/subadmin/${subAdminId}/profile`,
        { name: profile.name, imageUrl: "" }
      );

      if (res && res.data && res.data.subAdmin) {
        setProfile(res.data.subAdmin);
        setImagePreview(null);
        setImageFile(null);
        showOverlayMessage("Profile photo removed", "success");
      }
    } catch (err) {
      setError("Failed to remove photo. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING CONSTANTS ---
  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";
  const errorColor = isLight ? "#fee2e2" : "#7f1d1d";
  const successColor = isLight ? "#dcfce7" : "#064e3b";

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

  const currentSubAdminId =
    subAdminId || localStorage.getItem("subAdminId");

  if (!currentSubAdminId) return null;

  const firstLetter = profile.name ? profile.name.charAt(0).toUpperCase() : null;

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
                      subAdminId,
                      imageUrl: imagePreview || profile.imageUrl,
                    },
                  })
                }
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: isLight ? "#e2e8f0" : "#334155",
                  color: textMain,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
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
                Edit Profile
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

          {/* Form Content */}
          <form onSubmit={handleSave}>
            {/* Image Upload */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <div style={{ position: "relative", marginBottom: "16px" }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `4px solid ${
                        isLight ? "rgba(255,255,255,0.8)" : "rgba(30,41,59,0.8)"
                      }`,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: isLight ? "#e5e7eb" : "#374151",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "48px",
                      color: textSub,
                      border: `4px solid ${
                        isLight ? "rgba(255,255,255,0.8)" : "rgba(30,41,59,0.8)"
                      }`,
                      userSelect: "none",
                    }}
                  >
                    {firstLetter || "👤"}
                  </div>
                )}
                <label
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#10b981",
                    color: "white",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "18px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                {(profile.imageUrl || imagePreview) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                    style={{
                      marginLeft: 12,
                      marginTop: 8,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: 12,
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* Inputs */}
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
                  }}
                >
                  Name
                </label>
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
                  required
                />
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
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: `1px solid ${isLight ? "#e5e7eb" : "#374151"}`,
                    background: isLight ? "#f1f5f9" : "#1e293b",
                    color: textSub,
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("/subadmin", {
                      state: {
                        role: "SubAdmin",
                        subAdminId,
                        imageUrl: imagePreview || profile.imageUrl,
                      },
                    })
                  }
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: isLight ? "#e2e8f0" : "#334155",
                    color: textMain,
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: loading ? "#9ca3af" : "#10b981",
                    color: "white",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          {/* Alerts / Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: errorColor,
                  color: isLight ? "#991b1b" : "#fca5a5",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Overlay Modal */}
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

export default SubAdminEdit;
