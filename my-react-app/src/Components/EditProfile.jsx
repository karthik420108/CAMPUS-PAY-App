import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import API_CONFIG from "../config/api";
import Header from "./Header3"

// Removed Header1 import to get rid of the hamburger menu

function EditProfile() {
  const { state } = useLocation();

  const { userId, role } = state || {}; // Removed isFrozen as it was only used for Header1
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "light";
  });

  // Listen for theme changes from header
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "appTheme") {
        setTheme(e.newValue || "light");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for immediate updates
    const checkTheme = () => {
      const currentTheme = localStorage.getItem("appTheme");
      if (currentTheme !== theme) {
        setTheme(currentTheme || "light");
      }
    };
    
    const interval = setInterval(checkTheme, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (!userId) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(API_CONFIG.getUrl(`/user/${userId}`));
        setProfile({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          imageUrl: res.data.ImageUrl || "",
        });
        setImagePreview(res.data.ImageUrl || "/default-avatar.png");
      } catch {
        navigate("/");
      }
    };
    fetchProfile();
  }, [userId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError("First Name and Last Name are required");
      return;
    }
    
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("firstName", profile.firstName);
      formData.append("lastName", profile.lastName);
      formData.append("role", role + "pics");
      if (imageFile) formData.append("photo", imageFile);

      const response = await axios.post(API_CONFIG.getUrl("/update-profile"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check if there was an image upload error but text update succeeded
      if (response.data.warning) {
        setError(response.data.warning);
        // Clear the selected image but keep the old one
        setImageFile(null);
      }

      navigate(-1, {
        state: { userId, role, imageUrl: response.data.imageUrl || profile.imageUrl },
      });
    } catch (error) {
      console.error("Update error:", error);
      console.error("Response data:", error.response?.data);
      
      if (error.response?.data) {
        const errorMessage = error.response.data.error;
        setError(errorMessage || "Update failed. Please try again.");
      } else {
        setError("Update failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";

  // ---------- COLORS ----------
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  // ---------- PAGE BACKGROUND ----------
  const pageStyle = isLight
    ? {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
        overflow: "hidden",
      }
    : {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
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
        overflow: "hidden",
      };

  // ---------- CARD ----------
  const cardStyle = isLight
    ? {
        width: "100%",
        maxWidth: 500,
        borderRadius: 28,
        padding: "26px 22px 20px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
        overflow: "hidden",
        color: textMain,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow:
          "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
      }
    : {
        width: "100%",
        maxWidth: 500,
        borderRadius: 28,
        padding: "26px 22px 20px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
        overflow: "hidden",
        color: textMain,
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />
      <div style={pageStyle}>
      
      {/* Removed <Header1 /> here */}

      {/* Soft moving orbs */}
      {!isLight && (
        <>
          <motion.div
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
              filter: "blur(40px)",
              opacity: 0.5,
              top: -40,
              left: -60,
              mixBlendMode: "screen",
            }}
            animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
              filter: "blur(34px)",
              opacity: 0.5,
              bottom: -40,
              right: -40,
              mixBlendMode: "screen",
            }}
            animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: easingSoft }}
        style={cardStyle}
      >
        {/* Theme toggle */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 5px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
            fontSize: 11,
            zIndex: 5,
          }}
        >
          <span style={{ color: "#6b7280" }}>Mode</span>
          <button
            type="button"
            onClick={() =>
              setTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
            style={{
              border: "none",
              borderRadius: 999,
              padding: "3px 10px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: isLight
                ? "linear-gradient(120deg,#020617,#0f172a)"
                : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
              color: isLight ? "#e5e7eb" : "#0f172a",
            }}
          >
            {isLight ? "Dark" : "Light"}
          </button>
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: textMain,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Edit Profile
        </h2>

        {/* Profile Image */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={imagePreview || "/default-avatar.png"}
              alt="Profile"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                objectFit: "cover",
                border: `4px solid ${isLight ? "#10b981" : "#059669"}`,
              }}
            />
            <label
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: isLight ? "#10b981" : "#059669",
                color: "#fff",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                fontSize: 18,
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
          </div>
        </div>

        {/* Name fields */}
        {["firstName", "lastName"].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field === "firstName" ? "First Name" : "Last Name"}
            value={profile[field]}
            onChange={(e) =>
              setProfile({ ...profile, [field]: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 14,
              border: `1px solid ${isLight ? "#94a3b8" : "#4b5563"}`,
              background: isLight ? "#fff" : "#1e293b",
              color: textMain,
              fontSize: 14,
            }}
          />
        ))}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              color: errorColor,
              fontSize: 13,
              textAlign: "center",
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={
            !loading
              ? { scale: 1.02, boxShadow: "0 0 18px rgba(129,140,248,0.85)" }
              : {}
          }
          whileTap={!loading ? { scale: 0.97 } : {}}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 14,
            border: "none",
            background:
              "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
            backgroundSize: "220% 220%",
            color: "#f9fafb",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            fontSize: 14,
            textTransform: "uppercase",
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </motion.button>
      </motion.form>
    </div>
    </>
  );
}

export default EditProfile;
