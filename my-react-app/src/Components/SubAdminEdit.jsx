import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";

function SubAdminEdit() {
  const { state } = useLocation();
  const { subAdminId } = state || {};
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayType, setOverlayType] = useState("success"); // success, error, info
  const [theme, setTheme] = useState("light");

  // Helper function to show overlay
  const showOverlayMessage = (message, type = "success") => {
    setOverlayMessage(message);
    setOverlayType(type);
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  if (!subAdminId) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/subadmin/${subAdminId}/profile`
        );
        setProfile(res.data);
        setImagePreview(res.data.imageUrl || "/default-avatar.png");
      } catch (err) {
        setError("Failed to load profile");
      }
    };
    fetchProfile();
  }, [subAdminId]);

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

      // Update profile data
      await axios.put(
        `http://localhost:5000/subadmin/${subAdminId}/profile`,
        profile
      );

      // Upload new image if changed
      if (imageFile) {
        const formData = new FormData();
        formData.append("profileImage", imageFile);
        formData.append("role", "subadminpics");
        
        await axios.post(
          "http://localhost:5000/upload/subadmin",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      showOverlayMessage("Profile Updated Successfully!", "success");
      setTimeout(() => {
        navigate("/subadmin", { 
          state: { role: "SubAdmin", subAdminId, imageUrl: imagePreview || profile.imageUrl }
        });
      }, 2000);
    } catch (err) {
      setError("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === "light";
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";
  const errorColor = isLight ? "#b91c1c" : "#fecaca";
  const successColor = isLight ? "#059669" : "#86efac";

  const pageStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
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
        minHeight: "100vh",
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

  return (
    <div style={pageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <button
            onClick={() => navigate("/subadmin", { 
              state: { role: "SubAdmin", subAdminId, imageUrl: profile.imageUrl }
            })}
            style={{
              padding: "10px 15px",
              backgroundColor: isLight ? "#6b7280" : "#374151",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, color: textMain }}>
            Edit Profile
          </h2>
          <div style={{ width: "45px" }}></div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            ...cardStyle,
            padding: "40px",
            borderRadius: "16px",
          }}
        >
          <form onSubmit={handleSave}>
            {/* Profile Image */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `4px solid ${isLight ? "#10b981" : "#059669"}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      backgroundColor: isLight ? "#e5e7eb" : "#374151",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: textSub,
                      fontSize: "48px",
                      border: `4px solid ${isLight ? "#10b981" : "#059669"}`,
                    }}
                  >
                    👤
                  </div>
                )}
                <label
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    backgroundColor: isLight ? "#10b981" : "#059669",
                    color: "white",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "18px",
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

            {/* Name Field */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: textMain,
                  fontWeight: "500",
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${isLight ? "#e5e7eb" : "#374151"}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: isLight ? "white" : "#1f2937",
                  color: textMain,
                  outline: "none",
                }}
                required
              />
            </div>

            {/* Email Field (Read-only) */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: textMain,
                  fontWeight: "500",
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
                  padding: "12px 16px",
                  border: `2px solid ${isLight ? "#e5e7eb" : "#374151"}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: isLight ? "#f3f4f6" : "#374151",
                  color: textSub,
                  outline: "none",
                }}
              />
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    backgroundColor: errorColor,
                    color: isLight ? "#7f1d1d" : "#991b1b",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    backgroundColor: successColor,
                    color: isLight ? "#064e3b" : "#065f46",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    textAlign: "center",
                  }}
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/subadmin", { 
                  state: { role: "SubAdmin", subAdminId, imageUrl: profile.imageUrl }
                })}
                style={{
                  padding: "12px 24px",
                  backgroundColor: isLight ? "#6b7280" : "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  backgroundColor: loading ? "#9ca3af" : (isLight ? "#10b981" : "#059669"),
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Success Overlay */}
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
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: isLight
                  ? "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,250,251,0.95))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95))",
                padding: "32px 40px",
                borderRadius: "20px",
                border: isLight
                  ? "1px solid rgba(148,163,184,0.3)"
                  : "1px solid rgba(148,163,184,0.5)",
                boxShadow: isLight
                  ? "0 25px 70px rgba(15,23,42,0.15), 0 0 0 1px rgba(148,163,184,0.2)"
                  : "0 25px 70px rgba(15,23,42,0.4), 0 0 0 1px rgba(30,64,175,0.6)",
                maxWidth: "450px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "20px",
                  animation: "bounce 1s infinite",
                }}
              >
                {overlayType === "success" && "✅"}
                {overlayType === "error" && "❌"}
                {overlayType === "info" && "ℹ️"}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: isLight ? "#1f2937" : "#f3f4f6",
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
                  color: isLight ? "#6b7280" : "#9ca3af",
                  lineHeight: "1.6",
                }}
              >
                {overlayMessage}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SubAdminEdit;
