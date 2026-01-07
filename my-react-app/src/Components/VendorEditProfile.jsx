import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import Header1 from "./Header1";
import SuspensionBanner from "./SuspensionBanner";
import { useVendorStatus } from "../hooks/useVendorStatus";

function VendorEditProfile() {
  const { state } = useLocation();
  const { vendorId } = state || {};
  const navigate = useNavigate();

  const [vendorName, setVendorName] = useState("");
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
  
  // Use vendor status hook for real-time monitoring
  const { showSuspensionBanner } = useVendorStatus(vendorId);

  if (!vendorId) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    axios
      .post(`http://localhost:5000/vendor/${vendorId}`)
      .then((res) => {
        setVendorName(res.data.vendorName || "");
        setImagePreview(res.data.ImageUrl || "/default-avatar.png");
      });
  }, [vendorId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      setError("Vendor name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("vendorName", vendorName);
      formData.append("role", "vendorpics");
      if (imageFile) formData.append("profileImage", imageFile);

      await axios.put(
        `http://localhost:5000/vendor/update-profile/${vendorId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      navigate("/vlogin", { state: { vendorId } });
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";
  const errorColor = isLight ? "#b91c1c" : "#fecaca";

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

  const inputStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0 0, rgba(219,234,254,0.9), transparent 70%), rgba(255,255,255,0.98)",
        border: "1px solid rgba(148,163,184,0.9)",
        boxShadow:
          "0 10px 24px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(248,250,252,0.95)",
      }
    : {
        background:
          "radial-gradient(circle at 0 0, rgba(30,64,175,0.38), transparent 70%), #020617",
        border: "1px solid rgba(51,65,85,0.95)",
        boxShadow:
          "0 12px 30px rgba(15,23,42,0.75), inset 0 0 0 1px rgba(15,23,42,0.9)",
      };

  return (
    <>
      <SuspensionBanner show={showSuspensionBanner} />
      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          overflow: "hidden",
          position: "relative",
          ...pageStyle,
        }}
      >
        {/* background orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
              : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
            filter: "blur(40px)",
            opacity: 0.5,
            top: -40,
            left: -60,
            mixBlendMode: isLight ? "normal" : "screen",
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
            background: isLight
              ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
              : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
            filter: "blur(34px)",
            opacity: 0.5,
            bottom: -40,
            right: -40,
            mixBlendMode: isLight ? "normal" : "screen",
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(59,130,246,0.5)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "8px 14px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
            color: "#f9fafb",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            zIndex: 10,
          }}
        >
          ← Back
        </motion.button>

        {/* Card */}
        <motion.form
          onSubmit={handleSave}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 650,
            borderRadius: 28,
            padding: "26px 22px 20px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            overflow: "hidden",
            ...cardStyle,
          }}
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

          {/* Header */}
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: textSub,
                marginBottom: 4,
              }}
            >
              Vendor Profile
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain }}>
              Edit Profile
            </h2>
          </div>

          {/* Vendor Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: textMain }}>Vendor Name</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Enter vendor name"
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                fontSize: 14,
                outline: "none",
                color: textMain,
                ...inputStyle,
              }}
            />
          </div>

          {/* Profile Image */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: textMain }}>Profile Image</label>
            <motion.label
              whileHover={{
                scale: 1.015,
                boxShadow: "0 0 18px rgba(191,219,254,0.8)",
                borderColor: isLight
                  ? "rgba(96,165,250,0.95)"
                  : "rgba(56,189,248,0.95)",
              }}
              whileTap={{ scale: 0.985 }}
              style={{
                cursor: "pointer",
                padding: "9px 12px",
                borderRadius: 14,
                border: `1px dashed ${
                  isLight ? "rgba(148,163,184,0.9)" : "rgba(75,85,99,0.95)"
                }`,
                fontSize: 13,
                color: textMain,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: isLight
                  ? "linear-gradient(130deg, rgba(255,255,255,0.98), rgba(239,246,255,0.98))"
                  : "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.98))",
              }}
            >
              <span>{imageFile ? imageFile.name : "Attach new image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </motion.label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  marginTop: 6,
                  objectFit: "cover",
                  border: `2px solid ${isLight ? "#3b82f6" : "#0ea5e9"}`,
                }}
              />
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: easingSoft }}
                style={{
                  color: errorColor,
                  fontSize: 13,
                  textAlign: "center",
                  fontWeight: 500,
                  marginTop: 2,
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

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
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </motion.button>
        </motion.form>
      </motion.div>
    </>
  );
}

export default VendorEditProfile;
